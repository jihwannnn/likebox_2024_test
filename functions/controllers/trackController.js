// controllers/trackController.js
const { onCall } = require("firebase-functions/v2/https");
const { https } = require("firebase-functions/v2");
const trackService = require("../services/trackService");
const { logControllerStart, logControllerFinish, logControllerError } = require("../utils/logger");

// 트랙 목록 조회
const getTracks = onCall({ region: "asia-northeast3" }, async (request) => {
  try {
    logControllerStart("getTracks");

    // 인증된 요청인지 확인
    const auth = request.auth;
    if (!auth) {
      throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    const uid = auth.uid;
    const { trackIds } = request.data;

    if (trackIds) {
      throw new https.HttpsError("invalid-argument", "유효한 ISRC 배열이 필요합니다.");
    }

    // 트랙 목록 조회
    const tracks = await trackService.getTracks(uid, trackIds);

    logControllerFinish("getTracks");

    return { success: true, data: tracks };
  } catch (error) {
    logControllerError("getTracks", error);
    throw error;
  }
});

module.exports = {
  getTracks
};