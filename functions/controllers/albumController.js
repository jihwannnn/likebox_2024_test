// controllers/albumController.js
const { onCall } = require("firebase-functions/v2/https");
const { https } = require("firebase-functions/v2");
const albumService = require("../services/albumService");
const userContentDataService = require("../services/userContentDataService");
const { logControllerStart, logControllerFinish, logControllerError } = require("../utils/logger");

const { addTracksToAlbum } = require("../utils/addTracks");

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

    // to be fix
    const albumData = await addTracksToAlbum(album)

    logControllerFinish("getAlbum");

    return { success: true, data: albumData };
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

    // to be fix
    const albumsData = albums.map(async (album) => addTracksToAlbum(album));

    logControllerFinish("getAlbums");

    return { success: true, data: albumsData };
  } catch (error) {
    logControllerError("getAlbums", error);
    throw error;
  }
});

const getPlatformsAlbums = onCall({ region: "asia-northeast3" }, async (request) => {
  try{
    logControllerStart("getPlatformsAlbums");

    // 인증된 요청인지 확인
    const auth = request.auth;
    if (!auth) {
      throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    const uid = auth.uid;
    const platforms = request.data;

    const contentData = userContentDataService.getContentData(uid);
    const albumIds = new Set();

    platforms.forEach(platform => {
      let platformsAlbums = contentData.getPlatformsAlbums(platform);
      platformsAlbums.forEach(albumId => albumIds.add(albumId));
    });

    const albums = albumService.getAlbums(uid, Array.from(albumIds));

    // to be fix
    const albumsData = albums.map(async (album) => addTracksToAlbum(album));

    logControllerFinish("getPlatformsAlbums");
    return { success: true, data: albumsData };
  } catch {
    logControllerError("getPlatformsAlbums", error);
    throw error;
  }
});

module.exports = {
  getAlbum,
  getAlbums,
  getPlatformsAlbums
};