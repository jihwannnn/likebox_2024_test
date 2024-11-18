const axios = require("axios");
const querystring = require("querystring");

const { logPlatformStart, logPlatformFinish, logPlatformError } = require("../utils/logger");
const Platform = require("./PlatformInterface");
const Token = require("../models/Token");
const { Track, Playlist, Album } = require("../models/Content");
const { 
  SPOTIFY_CLIENT_ID, 
  SPOTIFY_CLIENT_SECRET, 
  FOR_SERVER_REDIRECT_URI 
} = require("../params");
const { convertDateToInt } = require("../utils/converDateToInt");

class Spotify extends Platform {
  getAuthUrl() {
    const scopes = "user-read-private user-read-email";
    
    return `https://accounts.spotify.com/authorize?${querystring.stringify({
      response_type: "code",
      client_id: SPOTIFY_CLIENT_ID.value(),
      scope: scopes,
      redirect_uri: FOR_CLIENT_REDIRECT_URI.value(),
    })}`;
  }

  async exchangeCodeForToken(uid, authCode) {
    try {
      logPlatformStart("Spotify", "exchangeCodeForToken");

      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        querystring.stringify({
          grant_type: "authorization_code",
          code: authCode,
          redirect_uri: FOR_SERVER_REDIRECT_URI.value(),
          client_id: SPOTIFY_CLIENT_ID.value(),
          client_secret: SPOTIFY_CLIENT_SECRET.value(),
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      logPlatformFinish("Spotify", "exchangeCodeForToken");
      return new Token(uid, "spotify", response.data.access_token, response.data.refresh_token);
    } catch (error) {
      logPlatformError("Spotify", "exchangeCodeForToken", error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      logPlatformStart("Spotify", "refreshAccessToken");

      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        querystring.stringify({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: SPOTIFY_CLIENT_ID.value(),
          client_secret: SPOTIFY_CLIENT_SECRET.value(),
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      logPlatformFinish("Spotify", "refreshAccessToken");
      return response.data.access_token;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400 && data.error === "invalid_grant") {
          logPlatformFinish("Spotify", "refreshAccessToken");
          logger.info("Info: Refresh token is invalid or has been revoked.");
          return null;
        }
      }
      throw error;
    }
  }

  convertToTracks(tracksData) {
    return tracksData
      .filter(track => track.track.external_ids?.isrc)
      .map(track => {
        const isrc = track.track.external_ids.isrc;
        return new Track(
          isrc,                   // isrc (id)
          track.track.id,         // pid
          "SPOTIFY",              // platform
          track.track.name,       // name
          track.track.album.images.length > 0 ? track.track.album.images[0].url : "", // albumArtUrl
          track.track.artists.map(artist => artist.name), // artist
          track.track.album.name, // albumName
          track.track.duration_ms // durationMs
        );
      });
  }

  async getLikedTracks(accessToken) {
    try {
      logPlatformStart("Spotify", "getLikedTracks");

      let allTracks = [];
      let hasMoreTracks = true;
      const limit = 50;
      let offset = 0;

      while (hasMoreTracks) {
        const response = await axios.get(
          `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );

        const tracks = this.convertToTracks(response.data.items);
        allTracks = allTracks.concat(tracks);

        hasMoreTracks = response.data.next !== null;
        offset += hasMoreTracks ? limit : 0;
      }

      const isrcs = allTracks.map(track => track.id);

      logPlatformFinish("Spotify", "getLikedTracks");
      return { isrcs, allTracks };
    } catch (error) {
      logPlatformError("Spotify", "getLikedTracks", error);
      throw error;
    }
  }

  async getPlaylistTracks(playlistId, accessToken) {
    try {
      logPlatformStart("Spotify", `getPlaylistTracks for playlist: ${playlistId}`);

      let allTracks = [];
      let hasMoreTracks = true;
      const limit = 50;
      let offset = 0;

      while (hasMoreTracks) {
        const response = await axios.get(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );

        const tracks = this.convertToTracks(response.data.items);
        allTracks = allTracks.concat(tracks);

        hasMoreTracks = response.data.next !== null;
        offset += hasMoreTracks ? limit : 0;
      }

      logPlatformFinish("Spotify", `getPlaylistTracks for playlist: ${playlistId}`);
      return allTracks;
    } catch (error) {
      logPlatformError("Spotify", `getPlaylistTracks for playlist ${playlistId}`, error);
      throw error;
    }
  }

  async getPlaylists(accessToken) {
    try {
      logPlatformStart("Spotify", "getPlaylists");

      let allPlaylists = [];
      let allTracksSet = new Set();
      let hasMorePlaylists = true;
      const limit = 50;
      let offset = 0;

      while (hasMorePlaylists) {
        const response = await axios.get(
          `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );

        for (const playlistData of response.data.items) {
          const tracks = await this.getPlaylistTracks(playlistData.id, accessToken);
          const trackIsrcs = tracks.map(track => track.id);

          const playlist = new Playlist(
            playlistData.id,           // pid
            "SPOTIFY",                 // platform
            playlistData.name,         // name
            playlistData.description || "", // description
            playlistData.images.length > 0 ? playlistData.images[0].url : "", // coverImageUrl
            trackIsrcs,               // tracks (isrc array)
            playlistData.owner.id,    // owner
            playlistData.tracks.total // trackCount
          );

          allPlaylists.push(playlist);
          tracks.forEach(track => allTracksSet.add(track));
        }

        hasMorePlaylists = response.data.next !== null;
        offset += hasMorePlaylists ? limit : 0;
      }

      const allTracks = Array.from(allTracksSet);

      logPlatformFinish("Spotify", "getPlaylists");
      return { allPlaylists, allTracks };
    } catch (error) {
      logPlatformError("Spotify", "getPlaylists", error);
      throw error;
    }
  }

  async getAlbumTracks(albumId, accessToken) {
    try {
      logPlatformStart("Spotify", "getAlbumTracks");

      let allTracks = [];
      let hasMoreTracks = true;
      const limit = 50;
      let offset = 0;

      while (hasMoreTracks) {
        const response = await axios.get(
          `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );

        const trackResponses = await Promise.all(
          response.data.items.map(track =>
            axios.get(`https://api.spotify.com/v1/tracks/${track.id}`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            }).catch(error => {
              logPlatformError("Spotify", `getAlbumTracks for track ${track.id}`, error);
              return null;
            })
          )
        );

        const trackDatas = trackResponses
          .filter(response => response !== null)
          .map(response => ({ track: response.data }));

        const tracks = this.convertToTracks(trackDatas);
        allTracks = allTracks.concat(tracks);

        hasMoreTracks = response.data.next !== null;
        offset += hasMoreTracks ? limit : 0;
      }

      logPlatformFinish("Spotify", "getAlbumTracks");
      return allTracks;
    } catch (error) {
      logPlatformError("Spotify", "getAlbumTracks", error);
      throw error;
    }
  }

  async getAlbums(accessToken) {
    try {
      logPlatformStart("Spotify", "getSavedAlbums");

      let allAlbums = [];
      let allTracksSet = new Set();
      let hasMoreAlbums = true;
      const limit = 50;
      let offset = 0;

      while (hasMoreAlbums) {
        const response = await axios.get(
          `https://api.spotify.com/v1/me/albums?limit=${limit}&offset=${offset}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );

        for (const data of response.data.items) {
          const albumData = data.album;
          const tracks = await this.getAlbumTracks(albumData.id, accessToken);
          const trackIsrcs = tracks.map(track => track.id);

          if (albumData.external_ids?.upc) {
            const album = new Album(
              albumData.external_ids.upc,  // upc (id)
              albumData.id,                // pid
              "SPOTIFY",                   // platform
              albumData.name,              // name
              albumData.images.length > 0 ? albumData.images[0].url : "", // coverImageUrl
              albumData.artists.map(artist => artist.name), // artists
              trackIsrcs,                  // tracks (isrc array)
              convertDateToInt(albumData.release_date),      // releasedDate
              albumData.tracks.total       // trackCount
            );

            allAlbums.push(album);
            tracks.forEach(track => allTracksSet.add(track));
          }
        }

        hasMoreAlbums = response.data.next !== null;
        offset += hasMoreAlbums ? limit : 0;
      }

      const allTracks = Array.from(allTracksSet);

      logPlatformFinish("Spotify", "getSavedAlbums");
      return { allAlbums, allTracks };
    } catch (error) {
      logPlatformError("Spotify", "getSavedAlbums", error);
      throw error;
    }
  }
}

module.exports = Spotify;