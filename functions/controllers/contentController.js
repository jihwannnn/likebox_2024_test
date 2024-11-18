// controllers/ContentController.js
const { onCall } = require("firebase-functions/v2/https");
const { https } = require("firebase-functions/v2");
const userContentDataService = require("../services/userContentDataService");
const trackService = require("../services/trackService");
const albumService = require("../services/albumService");
const playlistService = require("../services/playlistService");
const { logControllerStart, logControllerFinish, logControllerError } = require("../utils/logger");


const getLikedContent = onCall({ region: "asia-northeast3" }, async (request) => {
  try {
    logControllerStart("getSavedContent");

    const auth = request.auth;
    if (!auth) {
      throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    const uid = auth.uid;
    const { platform, type } = request.data;

    if (!platform) {
      throw new https.HttpsError("invalid-argument", "플랫폼 정보가 필요합니다.");
    }

    if (!type) {
      throw new https.HttpsError("invalid-argument", "유효한 콘텐츠 타입이 필요합니다.");
    }

    const contentData = await userContentDataService.getContentData(uid);

    if (!contentData) {
      return { success: false, data: null }
    }

    let content;
    switch (type) {
      case "TRACK":
        content = trackService.getTracks(contentData.getLikedTracksByPlatform(platform));
        break;
      case "PLAYLIST":
        content = playlistService.getPlaylists(contentData.getPlaylistsByPlatform(platform));
        break;
      case "ALBUM":
        content = albumService.getAlbums(contentData.getAlbumsByPlatform(platform));
        break;

      default:
        throw new Error(`Unknown content type: ${contentType}`);
    }

    logControllerFinish("getSavedContent");
    return { success: true, data: content };
    
  } catch (error) {
    logControllerError("getSavedContent", error);
    throw error;
  }
});

module.exports = {
  getLikedContent
};