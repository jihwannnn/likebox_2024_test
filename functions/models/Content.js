// Content.js
class Content {
  constructor(id, pid, platform) {
    if (!id) {
      throw new Error("ID is required");
    }
    if (!pid) {
      throw new Error("PID is required");
    }
    if (!platform) {
      throw new Error("Platform is required");
    }

    this._id = id;
    this._pid = pid;
    this._platform = platform;
  }

  get id() {
    return this._id;
  }

  get pid() {
    return this._pid;
  }

  get platform() {
    return this._platform;
  }

  toJSON() {
    return {
      id: this._id,
      pid: this._pid,
      platform: this._platform
    };
  }
}

// Playlist
class Playlist extends Content {
  constructor(pid, platform, name = "", description = "", coverImageUrl = "", tracks = [], owner = "") {
    super(pid+platform, pid, platform);
    this.name = name;
    this.description = description;
    this.coverImageUrl = coverImageUrl;
    this.tracks = tracks;
    this.owner = owner;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      name: this.name,
      description: this.description,
      coverImageUrl: this.coverImageUrl,
      tracks: this.tracks.map(track => track.toJSON()),
      owner: this.owner
    };
  }
}

// Track
class Track extends Content {
  constructor(isrc, pid, platform, name = "", albumArtUrl = "", artist = [], albumName = "", durationMs = 0) {
    super(isrc, pid, platform);
    this.name = name;
    this.albumArtUrl = albumArtUrl;
    this.artist = artist;
    this.albumName = albumName;
    this.durationMs = durationMs;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      name: this.name,
      albumArtUrl: this.albumArtUrl,
      artist: this.artist,
      albumName: this.albumName,
      durationMs: this.durationMs
    };
  }
}

// Album
class Album extends Content {
  constructor(upc, pid, platform, name = "", coverImageUrl = "", artists = [], tracks = [], releasedDate = "", trackCount = 0) {
    super(upc, pid, platform);
    this.name = name;
    this.coverImageUrl = coverImageUrl;
    this.artists = artists;
    this.tracks = tracks;
    this.releasedDate = releasedDate;
    this.trackCount = trackCount;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      name: this.name,
      coverImageUrl: this.coverImageUrl,
      artists: this.artists,
      tracks: this.tracks.map(track => track.toJSON()),
      releasedDate: this.releasedDate,
      trackCount: this.trackCount
    };
  }
}

module.exports = {
  Content,
  Playlist,
  Track,
  Album
};