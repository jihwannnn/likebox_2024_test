const admin = require("firebase-admin");

admin.initializeApp(); // Firebase Admin 초기화

const generalController = require("./controllers/generalController");
const infoController = require("./controllers/infoController");
const playlistController = require("./controllers/playlistController");
const settingController = require("./controllers/settingController");
const tokenController = require("./controllers/tokenController");
const synchController = require("./controllers/synchController");


// General
exports.createDefault = generalController.createDefault;
exports.generateUrl = generalController.generateUrl;

// Info
exports.checkInfo = infoController.checkInfo;
exports.updateInfo = infoController.updateInfo;

// Setting
exports.checkSetting = settingController.checkSetting;
exports.updateSetting = settingController.updateSetting;

// Sync
exports.synchLikedTracks = synchController.synchLikedTracks;
exports.synchPlaylists = synchController.synchPlaylists;

// Token
exports.generateToken = tokenController.generateToken;
exports.verifyToken = tokenController.verifyToken;
exports.removeToken = tokenController.removeToken; 
exports.removeAllTokens = tokenController.removeAllTokens

// // Playlist
// exports.getPlaylists = playlistController.getPlaylists;
// exports.getPlaylistById = playlistController.getPlaylistById;

// // Track
// exports.getTracks = trackController.getTracks;
// exports.searchTracks = trackController.searchTracks;

// // Album
// exports.getAlbums = albumController.getAlbums;
// exports.getAlbumById = albumController.getAlbumById;