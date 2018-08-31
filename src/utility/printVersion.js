const selfMeta = require('../../package.json');
const LPS = require('lps');

module.exports = function printVersion(isVerbose) {
  if (isVerbose) {
    // show CLI and lps.js versions
    const versionLabel = 'lps-cli v' + selfMeta.version + '/ lps.js v' + LPS.meta.version;
    console.log('Logic Production Systems (LPS)\n' + versionLabel);
    return;
  }
  // only show CLI tools version if not verbose
  console.log(selfMeta.version);
};