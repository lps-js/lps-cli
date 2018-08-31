#!/usr/bin/env node

const LPS = require('lps');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const Logger = require('../src/utility/Logger');
const buildOptionList = require('../src/utility/buildOptionList');
const optionDefinitions = require('../src/options/generate-spec');
const printVersion = require('../src/utility/printVersion');
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
      let profiler = engine.getProfiler();
      writeOutput('% --- Specification generated for ' + programFile + '\n');
      
      engine.on('postCycle', () => {
        let currentTime = engine.getCurrentTime();
        let startTime = currentTime - 1;
        let endTime = currentTime;
        
        writeOutput('% --- Start of cycle ' + endTime + ' ---\n');
        writeOutput('expect_num_of(' + ['fluent', currentTime, profiler.get('numState')].join(', ') + ').\n');
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
        
        writeOutput('expect_num_of(' + ['action', startTime, endTime, profiler.get('lastCycleNumActions')].join(', ') + ').\n');
        engine.getLastCycleActions().forEach((termArg) => {
          let lpsTerm = LPS.literal(termArg);
          let args = lpsTerm.getArguments();
          let term = new LPS.Functor(lpsTerm.getName(), args);
          writeOutput(INDENTATION + 'expect(' + ['action', startTime, endTime, term.toString()].join(', ') + ').\n');
        });
        
        writeOutput('expect_num_of(' + ['observation', startTime, endTime, profiler.get('lastCycleNumObservations')].join(', ') + ').\n');
        engine.getLastCycleObservations().forEach((termArg) => {
          let lpsTerm = LPS.literal(termArg);
          let args = lpsTerm.getArguments();
          let term = new LPS.Functor(lpsTerm.getName(), args);
          writeOutput(INDENTATION + 'expect(' + ['observation', startTime, endTime, term.toString()].join(', ') + ').\n');
        });
        
        writeOutput('expect_num_of(' + ['firedRules', endTime, profiler.get('lastCycleNumFiredRules')].join(', ') + ').\n');
        writeOutput('expect_num_of(' + ['resolvedGoals', endTime, profiler.get('lastCycleNumResolvedGoals')].join(', ') + ').\n');
        writeOutput('expect_num_of(' + ['unresolvedGoals', endTime, profiler.get('lastCycleNumUnresolvedGoals')].join(', ') + ').\n');
        writeOutput('expect_num_of(' + ['failedGoals', endTime, profiler.get('lastCycleNumFailedGoals')].join(', ') + ').\n');
        
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

function showHelp() {
  const sections = [
    {
      header: 'lps-generate-spec',
      content: 'LPS Program Specification Generator'
    },
    {
      header: 'Synopsis',
      content: [
        '$ lps-generate-spec [options ...] {underline program-file}',
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

const options = commandLineArgs(optionDefinitions, { stopAtFirstUnknown: true });

Logger.verbose = options._all.verbose;
Logger.quiet = options._all.quiet;

if (options._all.help) {
  showHelp();
} else if (options._all.version) {
  // if version option is set, show version.
  printVersion(options._all.verbose);
} else if (options._all.program) {
  generateSpec(options._all.program, options._all.out);
} else {
  showHelp();
}

  
