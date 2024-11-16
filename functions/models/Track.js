// Track model

class Track {
  constructor(tid, isrc, name = "", artist = [], albumName = "", albumArtUrl = "", durationMs = 0) {
    if (!tid) {
      throw new Error("TID is required");
    }
    if (!isrc) {
      throw new Error("ISRC is required");
    }
    this._tid = tid; //private
    this._isrc = isrc; // private
    this.name = name;
    this.artist = artist;
    this.albumName = albumName;
    this.albumArtUrl = albumArtUrl;
    this.durationMs = durationMs;
  }

  get tid() {
    return this._tid;
  }

  get isrc() {
    return this._isrc;
  }
}

module.exports = Track