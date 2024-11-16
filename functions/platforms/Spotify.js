// Spotify.js
const axios = require("axios");
const querystring = require("querystring");
const { logger } = require("firebase-functions/v2");
const Platform = require("./PlatformInterface");
const Token = require("../models/Token");
const Track = require("../models/Track");
const Playlist = require("../models/Playlist");
const Album = require("../models/Album");
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, FOR_SERVER_REDIRECT_URI } = require("../params");

class Spotify extends Platform {

  // spotify 인증 url 생성
  getAuthUrl() {
    const scopes = "user-read-private user-read-email";

    const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
      response_type: "code",
      client_id: SPOTIFY_CLIENT_ID.value(),
      scope: scopes,
      redirect_uri: FOR_CLIENT_REDIRECT_URI.value(),
    })}`;

    return authUrl;
  }

  // authCode -> Token
  async exchangeCodeForToken(uid, authCode) {
    try {
      logger.info("Spotify exchangeCodeForToken start");

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

      logger.info("Spotify exchangeCodeForToken finish");
      return new Token(uid, "spotify", response.data.access_token, response.data.refresh_token); // Token 관련 uid는 유지
    } catch (error) {
      logger.error("Error: Spotify, exchangeCodeForToken", error);
      throw error;
    }
  }

  // refreshToken -> accessToken
  async refreshAccessToken(refreshToken) {
    try {
      logger.info("Spotify refreshAccessToken start");

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

      logger.info("Spotify refreshAccessToken finish");
      return response.data.access_token;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400 && data.error === "invalid_grant") {
          logger.info("Info: Refresh token is invalid or has been revoked.");
        } else {
          logger.error(`Error: Spotify, refreshAccessToken failed with status ${status}`, data);
        }
      } else {
        logger.error("Error: Spotify, refreshAccessToken encountered an unexpected error", error);
      }
      return null;
    }
  }

  // data -> tracks
  convertToTracks(tracksData) {
    const tracks = tracksData
      .filter(track => track.track.external_ids?.isrc) // ISRC가 있는 경우에만 필터링
      .map(track => {
        // Track 인스턴스 생성
        return new Track(
          track.track.id, // tid
          track.track.external_ids.isrc, // isrc
          track.track.name, // name
          track.track.artists.map(artist => artist.name), // artists
          track.track.album.name, // albumName
          track.track.album.images.length > 0 ? track.track.album.images[0].url : "", // albumArtUrl
          track.track.duration_ms // durationMs
        );
      });
  
    return tracks;
  }

  // 좋아요한 트랙 가져오기
  async getLikedTracks(accessToken) {
    try {
      logger.info("Spotify getLikedTracks start");

      // 루프 구조 설정
      let allTracks = [];
      let hasMoreTracks = true;
      const limit = 50;
      let offset = 0;
      let response;

      while (hasMoreTracks) {
        response = await axios.get(
          `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            }
          }
        );

        let tracksData = response.data.items;
        let tracks = this.convertToTracks(tracksData);
        allTracks = allTracks.concat(tracks);

        // 루프 종료 확인
        if (!response.data.next) {
          hasMoreTracks = false;
        } else {
          offset += limit;
        }
      }

       // 트랙의 isrc 배열 생성
      const isrcs = allTracks.map((track) => track.isrc);

      // 새로운 플레이리스트 생성
      const playlist = new Playlist(
        "liked_tracks_playlist", // pid
        "SPOTIFY",
        "liked_tracks_playlist" + "spotify", // id
        "Liked Tracks Playlist by Spotify", // 이름
        "A playlist created from your spotify liked tracks", 
        "", // coverImageUrl
        isrcs, // isrcs 배열
      );

      logger.info("Spotify getLikedTracks finish");
      return { playlist, allTracks };
    } catch (error) {
      logger.error("Error: Spotify getLikedTracks", error);
      throw error;
    }
  }

  // 특정 플레이리스트의 트랙가져오기
  async getPlaylistTracks(playlistId, accessToken) {
    try {
      logger.info(`Spotify getPlaylistTracks start for playlist: ${playlistId}`);

      // 루프 구조 설정
      let allTracks = [];
      let hasMoreTracks = true;
      const limit = 50;
      let offset = 0;
      let response;

      while (hasMoreTracks) {
        response = await axios.get(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        let tracksData = response.data.items;
        let tracks = this.convertToTracks(tracksData);
        allTracks = allTracks.concat(tracks);

        // 루프 종료 조건
        if (!response.data.next) {
          hasMoreTracks = false;
        } else {
          offset += limit;
        }
      }

      logger.info(`Spotify getPlaylistTracks finish for playlist: ${playlistId}`);
      return allTracks;
    } catch (error) {
      logger.error(`Error: Spotify getPlaylistTracks for playlist ${playlistId}`, error);
      throw error;
    }
  }

  // 플레이리스트와 포함된 트랙들 가져오기
  async getPlaylists(accessToken) {
    try {
      logger.info("Spotify getPlaylists start");

      let allPlaylists = [];
      let allTracksSet = new Set();
      let hasMorePlaylists = true;
      const limit = 50;
      let offset = 0;
      let response;

      while (hasMorePlaylists) {
        response = await axios.get(
          `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            }
          }
        );

        let playlistsData = response.data.items;

        // 모든 플레이리스트 데이터 순회
        for (let playlistData of playlistsData) {
          // 해당 플레이리스트의 트랙 가져오기
          let tracks = await this.getPlaylistTracks(playlistData.id, accessToken);

          // 트랙 ISRC 배열 생성
          let isrcs = tracks.map(track => track.isrc);

          let playlist = new Playlist(
            playlistData.id, // pid
            "SPOTIFY", // platform
            playlistData.owner.id, // owner
            playlistData.id + "SPOTIFY", // id
            playlistData.name, // name
            playlistData.description || "", // description
            playlistData.images.length > 0 ? playlistData.images[0].url : "", // url
            isrcs, // 트랙 ISRC 배열
          );

          allPlaylists.push(playlist);
          tracks.forEach(track => allTracksSet.add(track));
        }

        if (!response.data.next) {
          hasMorePlaylists = false;
        } else {
          offset += limit;
        }
      }

      const allTracks = Array.from(allTracksSet);

      logger.info("Spotify getPlaylists finish");
      return { allPlaylists, allTracks };
    } catch (error) {
      logger.error("Error: Spotify getPlaylists", error);
      throw error;
    }
  }

  // 앨범들과 포함하는 트랙들 가져오기
  async getAlbums(accessToken) {
    try {
      logger.info("Spotify getSavedAlbums start");
  
      let allAlbums = [];
      let allTracksSet = new Set();
      let hasMoreAlbums = true;
      const limit = 50;
      let offset = 0;
      let response;
  
      while (hasMoreAlbums) {
        response = await axios.get(
          `https://api.spotify.com/v1/me/albums?limit=${limit}&offset=${offset}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
  
        const albumsData = response.data.items;
  
        // 모든 앨범 데이터 순회
        for (const data of albumsData) {
          const albumData = data.album;
  
          // 각 앨범의 트랙 정보 가져오기
          let tracks = await this.getAlbumTracks(albumData.id, accessToken);
          const isrcs = tracks.map(track => track.isrc);
  
          const album = new Album(
            albumData.id, // aid
            "SPOTIFY", // platform
            albumData.external_ids.isrc, // isrc
            albumData.name, // name
            albumData.artists.map(artist => artist.name), // artists
            albumData.images.length > 0 ? albumData.images[0].url : "", // coverImageUrl
            isrcs, // 트랙 ISRC 배열
            albumData.release_date, // releaseDate
            albumData.tracks.total // trackCount
          );
  
          allAlbums.push(album);
          tracks.forEach(track => allTracksSet.add(track));
        }
  
        // 루프 종료 조건
        if (!response.data.next) {
          hasMoreAlbums = false;
        } else {
          offset += limit;
        }
      }
  
      const allTracks = Array.from(allTracksSet);
  
      logger.info("Spotify getSavedAlbums finish");
      return { allAlbums, allTracks };
    } catch (error) {
      logger.error("Error: Spotify getSavedAlbums", error);
      throw error;
    }
  }

  // 특정 앨범의 트랙들 가져오기
  async getAlbumTracks(albumId, accessToken) {
    try {
      logger.info("Spotify getAlbumTracks start");

      let allTracks = [];
      let hasMoreTracks = true;
      const limit = 50;
      let offset = 0;
      let response;

      while (hasMoreTracks) {
        // 특정 앨범의 트랙 정보 가져오기
        response = await axios.get(
          `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const tracksData = response.data.items;
        const tracks = this.convertToTracks(tracksData);
        allTracks = allTracks.concat(tracks);

        if (!response.data.next) {
          hasMoreTracks = false;
        } else {
          offset += limit;
        }
      }

      logger.info("Spotify getAlbumTracks finish");
      return allTracks;
    } catch (error) {
      logger.error("Error: Spotify getAlbumTracks", error);
      throw error;
    }
  }
}

module.exports = Spotify;
