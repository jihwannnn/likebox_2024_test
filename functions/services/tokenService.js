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
      .doc(token.platform);

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
      .doc(platform);
    const tokenDoc = await tokenRef.get();

    if (!tokenDoc.exists) {
      return null
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

// db에서 토큰 삭제하기
async function deleteToken(uid, platform) {
  // debugging log
  logger.info("service phase start for token deletion");

  try {
    const tokenRef = db
      .collection("Tokens")
      .doc(uid)
      .collection("User_tokens")
      .doc(platform);

    await tokenRef.delete();

    // debugging log
    logger.info("service phase finish for token deletion");
  } catch (error) {
    logger.error("Error: Service, deleting token:", error);
    throw error;
  }
}

// db에서 모든 토큰 삭제하기
async function deleteAllTokens(uid) {
  // debugging log
  logger.info("service phase start for all tokens deletion");

  try {
    const tokensRef = db
      .collection("Tokens")
      .doc(uid)
      .collection("User_tokens");

    const tokens = await tokensRef.get();
    
    // 모든 토큰 문서 삭제
    const batch = db.batch();
    tokens.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // debugging log
    logger.info("service phase finish for all tokens deletion");
  } catch (error) {
    logger.error("Error: Service, deleting all tokens:", error);
    throw error;
  }
}

module.exports = { saveToken, getToken, deleteToken, deleteAllTokens };
