const admin = require("firebase-admin");

admin.initializeApp(); // Firebase Admin 초기화

const albumController = require("./controllers/albumController");
const generalController = require("./controllers/generalController");
const infoController = require("./controllers/infoController");
const playlistController = require("./controllers/playlistController");
const settingController = require("./controllers/settingController");
const synchController = require("./controllers/synchController");
const tokenController = require("./controllers/tokenController");
const trackController = require("./controllers/trackController");



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
exports.synchContent = synchController.synchContent;


// Token
exports.generateToken = tokenController.generateToken;
exports.verifyToken = tokenController.verifyToken;
exports.removeToken = tokenController.removeToken; 
exports.removeAllTokens = tokenController.removeAllTokens

// Playlist
exports.getPlaylists = playlistController.getPlaylists;
exports.getPlaylist = playlistController.getPlaylist;

// Track
exports.getTracks = trackController.getTracks;


// Album
exports.getAlbums = albumController.getAlbums;
exports.getAlbum = albumController.getAlbum;