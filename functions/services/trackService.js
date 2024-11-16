const { logger } = require("firebase-functions/v2");
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();
const Track = require("../models/Track");

// tracks[] 저장
async function saveTracks(tracks) {
  try {
    // debugging log
    logger.info("service phase start");

    const batch = db.batch();

    const promises = tracks.map(async (track) => {
      const trackRef = db.collection("Tracks").doc(track.isrc);

      // 문서가 이미 존재하는지 확인
      const doc = await trackRef.get();
      if (!doc.exists) {
        // 문서가 존재하지 않는 경우에만 배치에 추가
        batch.set(
          trackRef,
          {
            tid: track.tid,
            name: track.name,
            artist: track.artist,
            albumName: track.albumName,
            albumArtUrl: track.albumArtUrl,
            durationMs: track.durationMs,
          },
          { merge: false } // 병합하지 않고 덮어쓰기
        );
      }
    });

    // 모든 promise 기다리기
    await Promise.all(promises);

    // 배치 커밋
    await batch.commit();

    // debugging log
    logger.info("service phase finish");
  } catch (error) {
    logger.error("Error: Service, saving tracks in batch:", error);
    throw error;
  }
}

// tracks[] 가져오기
async function getTracks(isrcs) {
  try {
    // debugging log
    logger.info("service phase start");

    const tracks = [];
    const trackRefs = isrcs.map((isrc) => db.collection("Tracks").doc(isrc));

    // getAll로 한 번에 가져오기
    const trackDocs = await db.getAll(...trackRefs);

    // 성공적으로 가져온 트랙만 처리
    trackDocs.forEach((doc) => {
      if (doc.exists) {
        const data = doc.data();
        tracks.push(
          new Track(
            data.tid,
            doc.id, // ISRC (문서 ID)
            data.name,
            data.artist,
            data.albumName,
            data.albumArtUrl,
            data.durationMs
          )
        );
      }
    });

    // debugging log
    logger.info("service phase finish");
    return tracks;
  } catch (error) {
    logger.error("Error: Service, retrieving tracks in batch:", error);
    throw error;
  }
}

module.exports = { saveTracks, getTracks };
