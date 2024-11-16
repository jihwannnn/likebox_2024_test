const { logger } = require("firebase-functions/v2");
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();
const Info = require("../models/Info")

// db에 info 저장
async function saveInfo(info) {
  try {
    // debugging log
    logger.info("service phase start");

    // db ref 가져오기
    const settingRef = db.collection("Infos").doc(info.uid);

    // 해당 ref에 저장
    await settingRef.set(
      {
        connectedPlatforms: info.connectedPlatforms,
        playlists: info.playlists
      },
      { merge: false }
    );

    // debugging log
    logger.info("service phase finish");
  } catch (error) {
    logger.error("Error: Service, save info:", error);
    throw error;
  }
}

// db에서 info 가져오기
async function getInfo(uid) {

  // debugging log
  logger.info("service phase start");

  try {
    const infoRef = db.collection("Infos").doc(uid);
    const infoDoc = await infoRef.get();

    if (!infoDoc.exists) {
      throw new Error("Info not found");
    }

    const infoData = infoDoc.data();
    const info = new Info(uid, infoData.connectedPlatforms, infoData.playlists);

    // debugging log
    logger.info("service phase finish");
    return info;
  } catch (error) {
    logger.error("Error: Service, retrieving tokens:", error);
    throw error;
  }
}

module.exports = { saveInfo, getInfo };
