// Playlist model

class Playlist {
  constructor(pid, platform, owner = "", name = "", description = "", coverImageUrl = "", tracks = []) {
    if (!pid) {
      throw new Error("PID is required");
    }
    if (!platform) {
      throw new Error("Platform is required.");
    }
    if (!owner) {
      throw new Error("Owner is required");
    }

    this._pid = pid; // private
    this._platform = platform; // private
    this._id = pid + platform; // private
    this.owner = owner;
    this.name = name;
    this.description = description;
    this.coverImageUrl = coverImageUrl;
    this.tracks = tracks;
  }

  get pid() {
    return this._pid;
  }
  
  get platform() {
    return this._platform;
  }
  
  get id() {
    return this._id;
  }
}

module.exports = Playlist;
