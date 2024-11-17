// playlistService.js
const { getFirestore } = require("firebase-admin/firestore");
const { Playlist } = require("../models/Content");
const { logServiceStart, logServiceFinish, logServiceError } = require("../utils/logger");

const db = getFirestore();
const COLLECTION_NAME = "Playlists";
const SUB_COLLECTION_NAME = "User_playlists";

async function savePlaylist(uid, playlist) {
  try {
    logServiceStart("savePlaylist");

    await db
      .collection(COLLECTION_NAME)
      .doc(uid)
      .collection(SUB_COLLECTION_NAME)
      .doc(playlist.id)
      .set(playlist.toJSON(), { merge: false });

    logServiceFinish("savePlaylist");
  } catch (error) {
    logServiceError("savePlaylist", error);
    throw error;
  }
}

async function savePlaylists(uid, playlists) {
  try {
    logServiceStart("savePlaylists");

    const batch = db.batch();
    const userPlaylistsRef = db.collection(COLLECTION_NAME).doc(uid).collection(SUB_COLLECTION_NAME);

    const promises = playlists.map(async (playlist) => {
      const docRef = userPlaylistsRef.doc(playlist.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        batch.set(docRef, playlist.toJSON(), { merge: false });
      }
    });

    await Promise.all(promises);
    await batch.commit();

    logServiceFinish("savePlaylists");
  } catch (error) {
    logServiceError("savePlaylists", error);
    throw error;
  }
}

async function getPlaylist(uid, id) {
  try {
    logServiceStart("getPlaylist");

    const playlistDoc = await db
      .collection(COLLECTION_NAME)
      .doc(uid)
      .collection(SUB_COLLECTION_NAME)
      .doc(id)
      .get();

    if (!playlistDoc.exists) {
      logServiceFinish("getPlaylist");
      return null;
    }

    const data = playlistDoc.data();
    const playlist = new Playlist(
      data.pid,
      data.platform,
      data.name,
      data.description,
      data.coverImageUrl,
      data.tracks,
      data.owner
    );

    logServiceFinish("getPlaylist");
    return playlist;
  } catch (error) {
    logServiceError("getPlaylist", error);
    throw error;
  }
}

async function getPlaylists(uid, ids) {
  try {
    logServiceStart("getPlaylists");

    const playlists = [];
    const userPlaylistsRef = db.collection(COLLECTION_NAME).doc(uid).collection(SUB_COLLECTION_NAME);

    const promises = ids.map(async (id) => {
      const doc = await userPlaylistsRef.doc(id).get();

      if (doc.exists) {
        const data = doc.data();
        playlists.push(
          new Playlist(
            data.pid,
            data.platform,
            data.name,
            data.description,
            data.coverImageUrl,
            data.tracks,
            data.owner
          )
        );
      }
    });

    await Promise.all(promises);

    logServiceFinish("getPlaylists");
    return playlists;
  } catch (error) {
    logServiceError("getPlaylists", error);
    throw error;
  }
}

module.exports = {
  savePlaylist,
  savePlaylists,
  getPlaylist,
  getPlaylists
};