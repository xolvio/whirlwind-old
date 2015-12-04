var log4js = require('log4js');
module.exports = function (id) {
  logger = log4js.getLogger(id);
  logger.setLevel(global.LOG_LEVEL || 'INFO');
  return logger;
};