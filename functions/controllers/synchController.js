const { onCall } = require("firebase-functions/v2/https");
const { logger, https } = require("firebase-functions/v2");

const tokenService = require("../services/tokenService");
const trackService = require("../services/trackService");
const playlistService = require("../services/playlistService");
const infoService = require("../services/infoService");
const PlatformFactory = require("../platforms/PlatformFactory");

const synchLikedTracks = onCall({ region: "asia-northeast3" }, async (request) => {
  try {
    // debugging log
    logger.info("handler phase start for liked tracks");

    // 인증된 요청인지 확인
    const auth = request.auth;
    if (!auth) {
      throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    // uid & platform
    const uid = auth.uid;
    const platform = request.data.platform;

    const info = infoService.getInfo(uid);

    // platform 객체 생성
    const platformInstance = PlatformFactory.getPlatform(platform);

    // 토큰 가져오기
    const tokens = await tokenService.getToken(uid, platform);
    const accessToken = tokens.accessToken;

    // 좋아요한 트랙 가져오기
    const { likedPlaylist, likedTracks } = await platformInstance.getLikedTracks(accessToken);
    await playlistService.savePlaylist(likedPlaylist);
    await trackService.saveTracks(likedTracks);

    // debugging log
    logger.info("handler phase finish for liked tracks");

    return { success: true, message: "Successfully saved liked tracks" };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logger.error("Error: Access token is expired or invalid.");
      return { success: false, message: "Access token is expired or invalid." };
    } else {
      throw error;
    }
  }
});

const synchPlaylists = onCall({ region: "asia-northeast3" }, async (request) => {
  try {
    // debugging log
    logger.info("handler phase start for playlists");

    // 인증된 요청인지 확인
    const auth = request.auth;
    if (!auth) {
      throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    // uid & platform
    const uid = auth.uid;
    const platform = request.data.platform;

    const info = infoService.getInfo(uid);

    // platform 객체 생성
    const platformInstance = PlatformFactory.getPlatform(platform);

    // 토큰 가져오기
    const tokens = await tokenService.getToken(uid, platform);
    const accessToken = tokens.accessToken;

    // 플레이리스트들 가져오기
    const { playlists, tracks } = await platformInstance.getPlaylist(accessToken);
    await playlistService.savePlaylists(playlists);
    await trackService.saveTracks(tracks);

    // debugging log
    logger.info("handler phase finish for playlists");

    return { success: true, message: "Successfully saved playlists and tracks" };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logger.error("Error: Access token is expired or invalid.");
      return { success: false, message: "Access token is expired or invalid." };
    } else {
      throw error;
    }
  }
});

module.exports = { synchLikedTracks, synchPlaylists };