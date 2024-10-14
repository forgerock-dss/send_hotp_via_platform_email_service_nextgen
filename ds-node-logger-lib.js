function XLogger(env) {
  this.logger = env.logger;
  this.scriptName = env.scriptName;
  this.logPrefix = "***" + env.scriptName + ": ";
  this.debug("logger initialised");
}

XLogger.prototype.debug = function (message) {
  this.logger.debug(this.logPrefix.concat(message));
};

XLogger.prototype.warn = function (message) {
  this.logger.warn(this.logPrefix.concat(message));
};

XLogger.prototype.error = function (message) {
  this.logger.error(this.logPrefix.concat(message));
};

module.exports.XLogger = XLogger;