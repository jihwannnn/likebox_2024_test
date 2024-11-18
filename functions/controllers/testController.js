const { onCall } = require("firebase-functions/v2/https");
const { https } = require("firebase-functions/v2");
const { 
    logControllerStart, 
    logControllerFinish, 
    logControllerError,
    logTestStart,
    logTestFinish,
    logTestError 
} = require("../utils/logger");

const testFunction1 = onCall({ region: "asia-northeast3" }, async (request) => {
    try {
        logControllerStart("testFunction1");

        const requestData = request.data;
        

        // 테스트 로깅
        logTestStart("testFunction", requestData);

        logTestFinish("testFunction", requestData);

        logControllerFinish("testFunction1");

        return {
            success: true,
            data: requestData
        };

    } catch (error) {
        logTestError("testFunction", error);
        logControllerError("testFunction", error);
        throw error;
    }
});

module.exports = {
    testFunction1
};