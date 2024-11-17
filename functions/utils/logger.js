const { logger } = require("firebase-functions/v2");

const logPlatformStart = (functionName) => {
  logger.info(`Platform phase start: ${functionName}`);
};

const logPlatformFinish = (functionName) => {
  logger.info(`Platform phase finish: ${functionName}`);
};

const logPlatformError = (functionName, error) => {
  logger.error(`Error in Platform, ${functionName}: `, error);
};

const logServiceStart = (functionName) => {
  logger.info(`Service phase start: ${functionName}`);
};

const logServiceFinish = (functionName) => {
  logger.info(`Service phase finish: ${functionName}`);
};

const logServiceError = (functionName, error) => {
  logger.error(`Error in Service, ${functionName}: `, error);
};

const logControllerStart = (functionName) => {
  logger.info(`Controller phase start: ${functionName}`);
};

const logControllerFinish = (functionName) => {
  logger.info(`Controller phase finish: ${functionName}`);
};

const logControllerError = (functionName, error) => {
  logger.error(`Error in Controller, ${functionName}: `, error);
};

module.exports = {
  logPlatformStart,
  logPlatformFinish,
  logPlatformError,
  logServiceStart,
  logServiceFinish,
  logServiceError,
  logControllerStart,
  logControllerFinish,
  logControllerError
};