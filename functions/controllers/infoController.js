const { onCall } = require("firebase-functions/v2/https");
const { logger, https } = require("firebase-functions/v2");

const infoService = require("../services/infoService");
const Info = require("../models/Info");

// Info 확인 프로세스
const checkInfo = onCall(async (request) => {
  try {
    // debugging log
    logger.info("handler phase start");

    // 인증된 요청인지 확인
    const auth = request.auth;

    if (!auth) {
      throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    const uid = auth.uid;

    // db에서 info 가져오기
    const info = await infoService.getInfo(uid);

    // debugging log
    logger.info("handler phase finish");

    return { success: true, data: info };
  } catch (error) {
    logger.error("Error: Controller, checking info,", error);
    throw new https.HttpsError("internal", "정보를 확인하는 데 실패했습니다.");
  }
});

// Info 업데이트 프로세스
const updateInfo = onCall(async (request) => {
  try {
    // debugging log
    logger.info("handler phase start");

    // 인증된 요청인지 확인
    const auth = request.auth;

    if (!auth) {
      throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    const uid = auth.uid;
    const infoData = request.data.info;

    // Info 객체 생성
    const info = new Info(uid, infoData.connectedPlatforms, infoData.playlist);

    // db에 정보 저장
    await infoService.saveInfo(uid, info);

    // debugging log
    logger.info("handler phase finish");

    return { success: true, message: "정보 업데이트 완료." };
  } catch (error) {
    logger.error("Error: Controller, updating info,", error);
    throw new https.HttpsError("internal", "정보를 업데이트하는 데 실패했습니다.");
  }
});

module.exports = { checkInfo, updateInfo };
