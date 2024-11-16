const admin = require("firebase-admin");

admin.initializeApp(); // Firebase Admin 초기화

const generalController = require("./controllers/generalController");
const infoController = require("./controllers/infoController");
const playlistController = require("./controllers/playlistController");
const settingController = require("./controllers/settingController");
const tokenController = require("./controllers/tokenController");
const synchController = require("./controllers/synchController");


exports.createDefault = generalController.createDefault;
exports.generateUrl = generalController.generateUrl;

exports.checkInfo = infoController.checkInfo;
exports.updateInfo = infoController.updateInfo;

exports.checkSetting = settingController.checkSetting;
exports.updateSetting = settingController.updateSetting;

exports.synchLikedTracks = synchController.synchLikedTracks;
exports.synchPlaylists = synchController.synchPlaylists;

exports.generateToken = tokenController.generateToken;
exports.verifyToken = tokenController.verifyToken;