const { logger } = require("firebase-functions/v2");
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();
const Album = require("../models/Album");

// albums[] 저장
async function saveAlbums(albums) {
  try {
    logger.info("Service phase start");

    const batch = db.batch();

    albums.forEach((album) => {
      const albumRef = db
        .collection("Albums")
        .doc(album.isrc); // ISRC

      // 앨범 데이터 저장
      batch.set(
        albumRef,
        {
          aid: album.aid,
          platform: album.platform,
          name: album.name,
          artists: album.artists,
          coverImageUrl: album.coverImageUrl,
          tracks: album.tracks,
          releasedAt: album.releasedAt,
          trackCount: album.trackCount,
        }
      );
    });

    // 배치 커밋
    await batch.commit();

    logger.info("Service phase finish");
  } catch (error) {
    logger.error("Error: Service, saving albums in batch:", error);
    throw error;
  }
}

// 모든 앨범 가져오기
async function getAlbums(isrcs) {
  try {
    logger.info("Service phase start");

    const albums = [];
    const albumsRef = db.collection("Albums")
    
    const promises = isrcs.map(async (isrc) => {
      const doc = await albumsRef.doc(isrc).get();
      if (doc.exists) {
        const data = doc.data();
        albums.push(
          new Album(
            data.aid,
            data.platform,
            doc.id, // ISRC (문서 ID)
            data.name,
            data.artists,
            data.coverImageUrl,
            data.tracks,
            data.releasedAt,
            data.trackCount
          )
        );
      }
    });

    // 모든 ISRC에 대한 검색이 완료될 때까지 기다림
    await Promise.all(promises);

    logger.info("Service phase finish");
    return albums;
  } catch (error) {
    logger.error("Error: Service, retrieving all albums:", error);
    throw error;
  }
}

module.exports = { saveAlbums, getAlbums };