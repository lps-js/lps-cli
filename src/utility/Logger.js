let Logger = {
  verbose: false,
  quiet: false
};

Logger.log = function log(message) {
  if (Logger.quiet || !Logger.verbose) {
    return;
  }
  console.log(message);
};

Logger.error = function error(message) {
  if (Logger.quiet) {
    return;
  }
  console.error(message);
};

module.exports = Logger;
