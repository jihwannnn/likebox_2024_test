const { logger } = require("firebase-functions/v2");
const { getFirestore } = require("firebase-admin/firestore");
const Token = require("../models/Token");
const { refreshToken } = require("firebase-admin/app");
const db = getFirestore();

// db에 토큰 저장
async function saveToken(token) {
  try {
    // debugging log
    logger.info("service phase start");

    const tokenRef = db
      .collection("Tokens")
      .doc(token.uid)
      .collection("User_tokens")
      .doc(token.platform); // 변경: platformId -> platform

    await tokenRef.set(
      {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken
      },
      { merge: false }
    );

    // debugging log
    logger.info("service phase finish");
  } catch (error) {
    logger.error("Error saving tokens:", error);
    throw error;
  }
}

// db에서 토큰 가져오기
async function getToken(uid, platform) {
  // debugging log
  logger.info("service phase start");

  try {
    const tokenRef = db
      .collection("Tokens")
      .doc(uid)
      .collection("User_tokens")
      .doc(platform); // 변경: platformId -> platform
    const tokenDoc = await tokenRef.get();

    if (!tokenDoc.exists) {
      throw new Error("Token not found");
    }

    const tokenData = tokenDoc.data();
    const token = new Token(uid, platform, tokenData.accessToken, tokenData.refreshToken);

    // debugging log
    logger.info("service phase finish");
    return token;
  } catch (error) {
    logger.error("Error: Service, retrieving tokens:", error);
    throw error;
  }
}
module.exports = { saveToken, getToken };
