let Logger = {
  verbose: false,
  quiet: false
};

Logger.log = function log(message) {
  if (Logger.quiet || !Logger.verbose) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log(message);
};

Logger.error = function error(message) {
  if (Logger.quiet) {
    return;
  }
  // eslint-disable-next-line no-console
  console.error(message);
};

module.exports = Logger;
