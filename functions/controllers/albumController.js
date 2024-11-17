// controllers/albumController.js
const { onCall } = require("firebase-functions/v2/https");
const { https } = require("firebase-functions/v2");
const albumService = require("../services/albumService");
const { logControllerStart, logControllerFinish, logControllerError } = require("../utils/logger");

// 단일 앨범 조회
const getAlbum = onCall({ region: "asia-northeast3" }, async (request) => {
  try {
    logControllerStart("getAlbum");

    // 인증된 요청인지 확인
    const auth = request.auth;
    if (!auth) {
      throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    const uid = auth.uid;
    const { albumId } = request.data;

    if (!albumId) {
      throw new https.HttpsError("invalid-argument", "앨범 UPC가 필요합니다.");
    }

    // 앨범 조회
    const album = await albumService.getAlbum(uid, albumId);
    if (!album) {
      throw new https.HttpsError("not-found", "앨범을 찾을 수 없습니다.");
    }

    logControllerFinish("getAlbum");

    return { success: true, data: album };
  } catch (error) {
    logControllerError("getAlbum", error);
    throw error;
  }
});

// 여러 앨범 조회
const getAlbums = onCall({ region: "asia-northeast3" }, async (request) => {
  try {
    logControllerStart("getAlbums");

    // 인증된 요청인지 확인
    const auth = request.auth;
    if (!auth) {
      throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    const uid = auth.uid;
    const { albumIds } = request.data;

    if (!albumIds) {
      throw new https.HttpsError("invalid-argument", "유효한 UPC 배열이 필요합니다.");
    }

    // 앨범 목록 조회
    const albums = await albumService.getAlbums(uid, albumIds);

    logControllerFinish("getAlbums");

    return { success: true, data: albums };
  } catch (error) {
    logControllerError("getAlbums", error);
    throw error;
  }
});

module.exports = {
  getAlbum,
  getAlbums
};