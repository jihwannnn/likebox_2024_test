const { onCall } = require("firebase-functions/v2/https");
const { logger, https } = require("firebase-functions/v2");

const settingService = require("../services/settingService");
const Setting = require("../models/Setting");

// Settings 확인 프로세스
const checkSetting = onCall(async (request) => {
  try {
    // debugging log
    logger.info("handler phase start");

    // 인증된 요청인지 확인
    const auth = request.auth;
    if (!auth) {
      throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    const uid = auth.uid;

    // db에서 setting 가져오기
    const setting = await settingService.getSetting(uid);

    // debugging log
    logger.info("handler phase finish");

    return { success: true, data: setting };
  } catch (error) {
    logger.error("Error: Controller, checking setting,", error);
    throw new https.HttpsError("internal", "설정을 확인하는 데 실패했습니다.");
  }
});

// Settings 업데이트 프로세스
const updateSetting = onCall(async (request) => {
  try {
    // debugging log
    logger.info("handler phase start");

    // 인증된 요청인지 확인
    const auth = request.auth;
    if (!auth) {
      throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    const uid = auth.uid;
    const settingData = request.data.setting;

    // Setting 객체 생성
    const setting = new Setting(uid, settingData.isDarkMode, settingData.notificationEnabled, settingData.language);

    // db에 설정 정보 저장
    await settingService.saveSetting(setting);

    // debugging log
    logger.info("handler phase finish");

    return { success: true, message: "설정이 성공적으로 업데이트되었습니다." };
  } catch (error) {
    logger.error("Error: Controller, updating setting,", error);
    throw new https.HttpsError("internal", "설정을 업데이트하는 데 실패했습니다.");
  }
});

module.exports = { checkSetting, updateSetting };
