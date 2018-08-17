#!/usr/bin/env node

const LPS = require('lps');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const selfMeta = require('../package.json');
const Logger = require('../src/utility/Logger');
const buildOptionList = require('../src/utility/buildOptionList');
const optionDefinitions = require('../src/options/generate-spec');
const fs = require('fs');

const args = process.argv.slice(2);
const programFile = args.length > 0 ? args[0] : null;
const specFile = args.length > 1 ? args[1]: null;

if (programFile === null) {
  console.error('A LPS program file must be supplied as arguments to the LPS spec generating program.');
  process.exit(1);
}

const INDENTATION = '  ';

function generateSpec(programFile, specFile) {
  let buffer = '';

  const writeOutput = (output) => {
    if (specFile !== null) {
      buffer += output;
      return;
    }
    process.stdout.write(output);
  };

  LPS.loadFile(programFile)
    .then((engine) => {
      engine.on('postCycle', () => {
        let currentTime = engine.getCurrentTime();
        let startTime = currentTime - 1;
        let endTime = currentTime;
        
        writeOutput('expect_num_of(' + ['fluent', currentTime, engine.getNumActiveFluents()].join(', ') + ').\n');
        engine.getActiveFluents().forEach((termArg) => {
          let lpsTerm = LPS.literal(termArg);
          let args = lpsTerm.getArguments();
          let term = new LPS.Functor(lpsTerm.getName(), args);
          writeOutput(INDENTATION + 'expect(' + ['fluent', currentTime, term.toString()].join(', ') + ').\n');
        });
        
        if (startTime === 0) {
          writeOutput('\n');
          return;
        }
        
        writeOutput('expect_num_of(' + ['action', startTime, endTime, engine.getNumLastCycleActions()].join(', ') + ').\n');
        engine.getLastCycleActions().forEach((termArg) => {
          let lpsTerm = LPS.literal(termArg);
          let args = lpsTerm.getArguments();
          let term = new LPS.Functor(lpsTerm.getName(), args);
          writeOutput(INDENTATION + 'expect(' + ['action', startTime, endTime, term.toString()].join(', ') + ').\n');
        });
        
        writeOutput('expect_num_of(' + ['observation', startTime, endTime, engine.getNumLastCycleObservations()].join(', ') + ').\n');
        engine.getLastCycleObservations().forEach((termArg) => {
          let lpsTerm = LPS.literal(termArg);
          let args = lpsTerm.getArguments();
          let term = new LPS.Functor(lpsTerm.getName(), args);
          writeOutput(INDENTATION + 'expect(' + ['observation', startTime, endTime, term.toString()].join(', ') + ').\n');
        });
        
        writeOutput('\n');
      });
      
      engine.on('error', (err) => {
        Logger.error(err);
      });
      
      if (specFile !== null) {
        // write to file when program is done
        engine.on('done', () => {
          fs.writeFile(specFile, buffer, () => {
            Logger.log('Spec file written to ' + specFile);
          });
        });
      }
      
      Logger.log('Executing ' + programFile);
      Logger.log('-----');
      engine.run();
    })
    .catch((err) => {
      Logger.error(err);
    });
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
} else if (options._all.program) {
  generateSpec(options._all.program, options._all.out);
} else {
  showHelp();
}

  
