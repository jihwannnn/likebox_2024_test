// trackService.js
const { getFirestore } = require("firebase-admin/firestore");
const { Track } = require("../models/Content");
const { logServiceStart, logServiceFinish, logServiceError } = require("../utils/logger");

const db = getFirestore();
const COLLECTION_NAME = "Tracks";
const SUB_COLLECTION_NAME = "User_tracks";

async function saveTracks(uid, tracks) {
  try {
    logServiceStart("saveTracks");

    const batch = db.batch();
    const userTracksRef = db.collection(COLLECTION_NAME).doc(uid).collection(SUB_COLLECTION_NAME);

    const promises = tracks.map(async (track) => {
      const docRef = userTracksRef.doc(track.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        batch.set(docRef, track.toJSON(), { merge: false });
      }
    });

    await Promise.all(promises);
    await batch.commit();

    logServiceFinish("saveTracks");
  } catch (error) {
    logServiceError("saveTracks", error);
    throw error;
  }
}

async function getTracks(uid, isrcs) {
  try {
    logServiceStart("getTracks");

    const tracks = [];
    const userTracksRef = db.collection(COLLECTION_NAME).doc(uid).collection(SUB_COLLECTION_NAME);

    const promises = isrcs.map(async (isrc) => {
      const doc = await userTracksRef.doc(isrc).get();

      if (doc.exists) {
        const data = doc.data();
        tracks.push(
          new Track(
            isrc,
            data.pid,
            data.platform,
            data.name,
            data.albumArtUrl,
            data.artist,
            data.albumName,
            data.durationMs
          )
        );
      }
    });

    await Promise.all(promises);

    logServiceFinish("getTracks");
    return tracks;
  } catch (error) {
    logServiceError("getTracks", error);
    throw error;
  }
}

module.exports = {
  saveTracks,
  getTracks
};