const { logger } = require("firebase-functions/v2");
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();
const Playlist = require("../models/Playlist");

// db에 Playlist 저장
async function savePlaylist(playlist) {
  try {
    // debugging log
    logger.info("service phase start");

    // db ref 가져오기 (ID만 사용)
    const playlistRef = db.collection("Playlists").doc(playlist.id);

    // 해당 ref에 저장
    await playlistRef.set(
      {
        pid: playlist.pid,
        platform: playlist.platform,
        owner: playlist.owner,
        name: playlist.name,
        description: playlist.description,
        coverImageUrl: playlist.coverImageUrl,
        tracks: playlist.tracks,
      },
      { merge: false } // 덮어쓰기
    );

    // debugging log
    logger.info("service phase finish");
  } catch (error) {
    logger.error("Error: Service, saving playlist:", error);
    throw error;
  }
}

// playlists[] 저장 (존재 여부 확인 생략)
async function savePlaylists(playlists) {
  try {
    // debugging log
    logger.info("service phase start");

    const batch = db.batch();

    // 각 플레이리스트를 Firestore에 추가 (ID만 사용)
    playlists.forEach((playlist) => {
      const playlistRef = db.collection("Playlists").doc(playlist.id);

      batch.set(
        playlistRef,
        {
          pid: playlist.pid,
          platform: playlist.platform,
          owner: playlist.owner,
          name: playlist.name,
          description: playlist.description,
          coverImageUrl: playlist.coverImageUrl,
          tracks: playlist.tracks,
        },
        { merge: false } // 덮어쓰기
      );
    });

    // 배치 커밋
    await batch.commit();

    // debugging log
    logger.info("service phase finish");
  } catch (error) {
    logger.error("Error: Service, saving playlists in batch:", error);
    throw error;
  }
}

// db에서 Playlist 가져오기
async function getPlaylist(id) {
  try {
    // debugging log
    logger.info("service phase start");

    const playlistRef = db.collection("Playlists").doc(id);
    const playlistDoc = await playlistRef.get();

    if (!playlistDoc.exists) {
      return null;
    }

    const playlistData = playlistDoc.data();
    const playlist = new Playlist(
      playlistData.pid,
      playlistData.platform,
      playlistData.owner,
      id,
      playlistData.name,
      playlistData.description,
      playlistData.coverImageUrl,
      playlistData.tracks,
    );

    // debugging log
    logger.info("service phase finish");
    return playlist;
  } catch (error) {
    logger.error("Error: Service, retrieving playlist:", error);
    throw error;
  }
}

// 특정 ID 배열에 해당하는 모든 Playlist 가져오기
async function getPlaylists(ids) {
  try {
    // debugging log
    logger.info("Service phase start");

    const playlists = [];
    const playlistsRef = db.collection("Playlists");

    // ids를 기반으로 가져오기
    const promises = ids.map(async (id) => {
      const doc = await playlistsRef.doc(id).get();
      if (doc.exists) {
        const data = doc.data();
        playlists.push(
          new Playlist(
            data.pid,
            data.platform,
            data.owner,
            id,
            data.name,
            data.description,
            data.coverImageUrl,
            data.tracks,
          )
        );
      }
    });

    // 프로미스 기다리기
    await Promise.all(promises);

    // debugging log
    logger.info("Service phase finish");
    return playlists;
  } catch (error) {
    logger.error("Error: Service, retrieving playlists:", error);
    throw error;
  }
}

module.exports = { savePlaylist, savePlaylists, getPlaylist, getPlaylists };
