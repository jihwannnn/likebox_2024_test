const { logger } = require("firebase-functions/v2");
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();
const Setting = require("../models/Setting");

// db에 setting 생성
async function saveSetting(setting) {
  try {
    // debugging log
    logger.info("service phase start");

    // db ref 가져오기
    const settingRef = db.collection("Settings").doc(setting.uid);

    // 해당 ref에 저장
    await settingRef.set(
      {
        isDarkMode: setting.isDarkMode,
        notificationEnabled: setting.notificationEnabled,
        language: setting.language,
      },
      { merge: false }
    );

    // debugging log
    logger.info("service phase finish");
  } catch (error) {
    logger.error("Error: Service, save setting:", error);
    throw error;
  }
}

// db에서 info 가져오기
async function getSetting(uid) {

  // debugging log
  logger.info("service phase start");

  try {
    const settingRef = db.collection("Settings").doc(uid);
    const settingDoc = await settingRef.get();

    if (!settingDoc.exists) {
      throw new Error("Info not found");
    }

    const settingData = settingDoc.data();
    const setting = new Setting(uid, settingData.isDarkMode, settingData.notificationEnabled, settingData.language);

    // debugging log
    logger.info("service phase finish");
    return setting;
  } catch (error) {
    logger.error("Error: Service, retrieving tokens:", error);
    throw error;
  }
}

module.exports = { saveSetting, getSetting };
