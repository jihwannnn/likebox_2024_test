const trackService = require("../services/trackService");

// 클라이언트 repo 보조 함수
async function addTracksToPlaylist(playlist){

  let tracks = trackService.getTracks(uid, playlist.tracks);
  let playlistData = playlist.toJSON()
  let tracksData = tracks.map( track => track.toJSON())
  playlistData["tracks"] = tracksData;

  return playlistData;

}

// 클라이언트 repo 보조 함수
async function addTracksToAlbum(album){

  let tracks = trackService.getTracks(uid, album.tracks);
  let albumData = album.toJSON()
  let tracksData = tracks.map( track => track.toJSON())
  albumData["tracks"] = tracksData;

  return albumData;

}

module.exports = {
  addTracksToPlaylist,
  addTracksToAlbum
}