#!/usr/bin/env node

const LPS = require('lps');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const Logger = require('../src/utility/Logger');
const buildOptionList = require('../src/utility/buildOptionList');
const optionDefinitions = require('../src/options/test');
const consoleColors = require('../src/utility/colors.json');
const printVersion = require('../src/utility/printVersion');

/**
 * Start the testing process for a program against its specification file.
 * @param  {string} programFile The path name on the file system to the LPS program file.
 * @param  {string} specFile    The path name on the file system to the specification file
 */
function runTest(programFile, specFile) {
  LPS.loadFile(programFile)
    .then((engine) => {
      Logger.log('Testing\t' + consoleColors.fgYellow + programFile + consoleColors.reset);
      Logger.log('using\t' + consoleColors.fgYellow + specFile + consoleColors.reset);
      Logger.log('-----');
      
      engine.on('warning', (err) => {
        Logger.error(err);
      });
      
      engine.on('error', (err) => {
        Logger.error(err);
        process.exitCode = 1;
      });
      
      let tester = new LPS.Tester(engine);
      return tester.test(specFile);
    })
    .then((result) => {
      if (result.success) {
        process.exitCode = 0;
        Logger.log(consoleColors.fgGreen + 'Successful' + consoleColors.reset);
        return;
      }
      Logger.error(consoleColors.fgRed + result.errors.length + ' errors:' + consoleColors.reset);
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

/**
 * Show help and usage guide for this tool
 */
function showHelp() {
  const sections = [
    {
      header: 'lps-test',
      content: 'LPS tester program'
    },
    {
      header: 'Synopsis',
      content: [
        '$ lps-test [options ...] {underline program-file} {underline spec-file}',
        '$ lps-test {bold --help}'
      ]
    },
    {
      header: 'Options',
      optionList: buildOptionList(optionDefinitions, 'main')
    },
    {
      header: 'Updating and more info',
      content: [
        'Use \'npm i -g lps-cli\' to update LPS CLI tools package.',
        'For bug reports and other contributions, please visit https://github.com/mauris/lps-cli'
      ]
    }
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
  process.exit(-1);
}

// process program arguments
const options = commandLineArgs(optionDefinitions, { stopAtFirstUnknown: true });

Logger.verbose = options._all.verbose;
Logger.quiet = options._all.quiet;

if (options._all.help) {
  showHelp();
} else if (options._all.version) {
  // if version option is set, show version.
  printVersion(options._all.verbose);
} else if (options._all.program && options._all.program.length === 2) {
  let programFile = options._all.program[0];
  let specFile = options._all.program[1];
  runTest(programFile, specFile);
} else {
  showHelp();
}

