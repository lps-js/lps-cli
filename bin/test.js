#!/usr/bin/env node

const LPS = require('lps');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const selfMeta = require('../package.json');
const Logger = require('../src/utility/Logger');
const buildOptionList = require('../src/utility/buildOptionList');
const optionDefinitions = require('../src/options/test');

function runTest(programFile, specFile) {
  LPS.loadFile(programFile)
    .then((engine) => {
      Logger.log('Testing\t' + programFile);
      Logger.log('using\t' + specFile);
      Logger.log('-----');
      
      engine.on('warning', (err) => {
        Logger.error(err);
      });
      
      engine.on('error', (err) => {
        Logger.error(err);
        process.exitCode = 1;
      });
      
      return engine.test(specFile);
    })
    .then((result) => {
      if (result.success) {
        process.exitCode = 0;
        Logger.log('Successful');
        return;
      }
      Logger.error(result.errors.length + ' errors:');
      result.errors.forEach((err) => {
        Logger.error('  ' + err);
      });
      process.exitCode = 1;
    })
    .catch((err) => {
      Logger.error(err.message);
      process.exitCode = 1;
    });  
}

function showHelp() {
  
}

const options = commandLineArgs(optionDefinitions, { stopAtFirstUnknown: true });

Logger.verbose = options._all.verbose;
Logger.quiet = options._all.quiet;

if (options._all.help) {
  showHelp();
} else if (options._all.version) {
  if (options._all.verbose) {
    const versionLabel = 'lps-cli v' + selfMeta.version + '/ lps.js v' + LPS.meta.version;
    console.log('Logic Production Systems (LPS)\n' + versionLabel);
  } else {
    console.log(selfMeta.version);
  }
} else if (options._all.program && options._all.program.length === 2) {
  let programFile = options._all.program[0];
  let specFile = options._all.program[1];
  runTest(programFile, specFile);
} else {
  showHelp();
}

