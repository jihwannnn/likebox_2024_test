// PlatformFactory.js, 플랫폼 인스턴스 생성 클래스
const Spotify = require("./Spotify");

class PlatformFactory {
  static getPlatform(platformId) {
    switch (platformId) {
      case "spotify":
        return new Spotify();
      case "melon":
        return new Melon();
      default:
        throw new Error(`Unsupported platform: ${platformId}`);
    }
  }
}

module.exports = PlatformFactory;