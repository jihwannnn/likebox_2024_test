const { onCall } = require("firebase-functions/v2/https");
const { logger, https } = require("firebase-functions/v2");
const jwtDecode = require("jwt-decode"); 

const tokenService = require("../services/tokenService");
const PlatformFactory = require("../platforms/PlatformFactory");

// 토큰 생성 프로세스
const generateToken = onCall({ region: "asia-northeast3" }, async (request) => {
 try {
   // debugging log
   logger.info("handler phase start");

   const auth = request.auth;
   
   if (!auth) {
     throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
   }

   // 클라이언트가 제공한 authCode 가져옴
   const authCode = request.data.code;
   if (!authCode) {
     throw new https.HttpsError("invalid-argument", "인증 코드가 제공되지 않았습니다.");
   }

   // 코드를 전달하여 토큰 가져옴
   const uid = auth.uid;
   const platform = request.data.platform;

   const platformInstance = PlatformFactory.getPlatform(platform);

   const token = await platformInstance.exchangeCodeForToken(uid, authCode);

   // 해당 토큰 저장
   await tokenService.saveToken(token);

   // debugging log
   logger.info("Token successfully saved for UID:", uid);
   logger.info("handler phase finish");

   return { success: true, message: "Token saved successfully.",  };
 } catch (error) {
   logger.error("Error: Controller, Token generating,", error);
   throw error;
 }
});

// 토큰 검증 프로세스
const verifyToken = onCall({ region: "asia-northeast3" }, async (request) => {
 try {
   // debugging log
   logger.info("handler phase start");

   const auth = request.auth;
   
   if (!auth) {
     throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
   }

   const uid = auth.uid;
   const platform = request.data.platform;
   let result;

   const platformInstance = PlatformFactory.getPlatform(platform);
 
   const token = await tokenService.getToken(uid, platform);

   if (!token) {
     logger.info("No Token");
     return { success: false, message: "Token doesn't exist" };
   }

   const accessToken = token.accessToken;
   const refreshToken = token.refreshToken;

   // 액세스 토큰 만료 시
   if (isTokenExpired(accessToken)) {
     logger.info("Access token expired, refreshing...");

     // 리프레스 토큰으로 새로운 액세스 토큰 받아옴
     const newAccessToken = await platformInstance.refreshAccessToken(refreshToken);

     // 새로운 액세스 토큰 없으면 유저가 인증부터 다시하도록 false 반환
     if (!newAccessToken) {
       logger.info("Refresh token expired or invalid");
       return { success: false, message: "Token refresh failed" };
     }

     // 액세스 토큰과 함께 db에 저장
     token.accessToken = newAccessToken;
     await tokenService.saveToken(token);

     logger.info("handler phase finish");
     return { success: true, message: "Access token refreshed successfully" };
   }

   // debugging log
   logger.info("Access token is still valid");
   logger.info("handler phase finish");
   return { success: true, message: "Access token is valid" };
 } catch (error) {
   logger.error("Error: Controller, token verification:", error);
   throw error;
 }
});

// 토큰 삭제 프로세스
const removeToken = onCall({ region: "asia-northeast3" }, async (request) => {
 try {
   // debugging log
   logger.info("handler phase start");

   const auth = request.auth;
   
   if (!auth) {
     throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
   }

   const uid = auth.uid;
   const platform = request.data.platform;

   await tokenService.deleteToken(uid, platform);

   // debugging log
   logger.info("Token successfully removed for UID:", uid);
   logger.info("handler phase finish");

   return { success: true, message: "Token removed successfully" };
 } catch (error) {
   logger.error("Error: Controller, Token removal,", error);
   throw error;
 }
});

// 모든 토큰 삭제 프로세스
const removeAllTokens = onCall({ region: "asia-northeast3" }, async (request) => {
  try {
    // debugging log
    logger.info("handler phase start");

    const auth = request.auth;
    
    if (!auth) {
      throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    const uid = auth.uid;

    // 서비스에도 추가 필요
    await tokenService.deleteAllTokens(uid);

    // debugging log
    logger.info("All tokens successfully removed for UID:", uid);
    logger.info("handler phase finish");

    return { success: true, message: "All tokens removed successfully" };
  } catch (error) {
    logger.error("Error: Controller, All tokens removal,", error);
    throw error;
  }
});

module.exports = { generateToken, verifyToken, removeToken, removeAllTokens };

// 액세스 토큰 만료 확인 프로세스
function isTokenExpired(token) {
 try {
   const decodedToken = jwtDecode(token);
   const currentTime = Math.floor(Date.now() / 1000);
   return decodedToken.exp < currentTime;
 } catch (error) {
   logger.error("Error: decoding token:", error);
   return true;
 }
}

module.exports = { generateToken, verifyToken, removeToken, removeAllTokens };