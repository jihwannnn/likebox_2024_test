// Info model

class Info {
  constructor(uid, connectedPlatforms=[], playlists=[], likedTracks=[], albums=[]) {
    if (!uid) {
      throw new Error("UID is required");
    }
    this._uid = uid; // private
    this.connectedPlatforms = connectedPlatforms;
    this.playlists = playlists;
  }
  
    // "uid" getter
  get uid() {
    return this._uid;
  }
}

module.exports = Info;