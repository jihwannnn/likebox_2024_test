// PlatformInterface.js, 플랫폼들의 상위 인터페이스. 메소드가 구현되지 않은 채로 호출되면 오류 던짐.
class PlatformInterface {

  // 인증 URL 가져오기
  getAuthUrl() {
    throw new Error("Method getAuthUrl() must be implemented in the subclass.");
  }

  // 토큰 교환
  async exchangeCodeForToken(uid, authCode) {
    throw new Error("Method exchangeCodeForToken() must be implemented in the subclass.");
  }

  // 토큰 갱신
  async refreshAccessToken(refreshToken) {
    throw new Error("Method refreshAccessToken() must be implemented in the subclass.");
  }

  // 좋아요한 트랙 동기화
  async getLikedTracks(uid, accessToken) {
    throw new Error("Method getLikedTracks() must be implemented in the subclass.");
  }

  // 플레이리스트 동기화
  async getPlaylists(uid, accessToken) {
    throw new Error("Method getPlaylists() must be implemented in the subclass.");
  }
}



module.exports = PlatformInterface;