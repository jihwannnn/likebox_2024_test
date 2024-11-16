// Album model

class Album {
  constructor(aid, platform, isrc, name = "", artists = [], coverImageUrl = "", tracks = [], releasedDate = "", trackCount = 0) {
    if (!aid) {
      throw new Error("PID is required");
    }
    if (!platform) {
      throw new Error("Platform is required.");
    }
    if (!isrc) {
      throw new Error("ISRC is required");
    }
    this._aid = aid; //private
    this._platform = platform; //private
    this._isrc = isrc; //private
    this.name = name;
    this.artists = artists;
    this.coverImageUrl = coverImageUrl;
    this.tracks = tracks;
    this.releasedDate = releasedDate;
    this.trackCount = trackCount;
  }

  get aid() {
    return this._aid;
  }

  get platform() {
    return this._platform;
  }

  get isrc() {
    return this._isrc;
  }
}

module.exports = Album;
