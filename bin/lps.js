#!/usr/bin/env node

const net = require('net');
const LPS = require('lps');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const Logger = require('../src/utility/Logger');
const buildOptionList = require('../src/utility/buildOptionList');
const optionDefinitions = require('../src/options/lps');
const printVersion = require('../src/utility/printVersion');

const executeProgram = function executeProgram(file, programArgs) {
  Logger.log('Loading file ' + file);
  if (programArgs.length > 0) {
    Logger.log('Program Arguments: ' + programArgs);
  }
  
  let startTime = Date.now();
  return LPS.loadFile(file, programArgs)
    .then((engine) => {
      let profiler = engine.getProfiler();
      Logger.log('File loaded in ' + (Date.now() - startTime) + 'ms');
      Logger.log('Cycle Interval set to ' + engine.getCycleInterval() + 'ms');
      
      engine.on('postCycle', () => {
        Logger.log('[ Time ' + engine.getCurrentTime() + ' ] -------------- ' + profiler.get('lastCycleExecutionTime') + 'ms');
        Logger.log('Actions:\t' + engine.getLastCycleActions());
        Logger.log('Fluents:\t' + engine.getActiveFluents());
        Logger.log('Obs:    \t' + engine.getLastCycleObservations());
        Logger.log('Num Rules Fired: ' + profiler.get('lastCycleNumFiredRules'));
        Logger.log('Num Rules Unresolved: ' + profiler.get('lastCycleNumUnresolvedGoals'));
        Logger.log('Num Rules Resolved: ' + profiler.get('lastCycleNumResolvedGoals'));
        Logger.log('Num Rules Failed: ' + profiler.get('lastCycleNumFailedGoals'));
        Logger.log('');
        Logger.log('');
      });
      
      engine.on('done', () => {
        Logger.log('Execution complete in ' + (Date.now() - startTime) + 'ms');
        process.exit(0);
      });
      
      engine.on('warning', (warning) => {
        Logger.error('[Warning ' + warning.type + '] ' + warning.message);
      });
      
      engine.on('error', (err) => {
        Logger.error('LPS executed halted due to runtime error.');
        Logger.error(err);
        process.exit(1);
      });
      
      startTime = Date.now();    
      engine.run();

      return Promise.resolve(engine);
    })
    .catch((err) => {
      Logger.error(err.message);
      process.exit(1);
    });
};

/**
 * Start a TCP server to listen for observations that will be passed into the running LPS program
 * @param  {number} portArg The port number to use, set to 0 for random available port determined
 *                          by the system.
 */
const startObservationServer = function startObservationServer(portArg) {
  let port = portArg;
  const server = net.createServer((socket) => {
    socket.on('data', (data) => {
      let strData = data.toString('utf8');
      let literal = LPS.literal(strData);
      engine.observe(literal);
    });
  });
  server.on('error', (err) => {
    Logger.error(err);
  });
  server.listen(port, function() {
    Logger.log('Observation server listening on port ' + server.address().port);
  });
};

/**
 * Show the help and usage guide for this program
 */
const showHelp = function showHelp() {
  const sections = [
    {
      header: 'lps',
      content: 'Logic Production System (LPS) runtime environment in Node.js'
    },
    {
      header: 'Synopsis',
      content: [
        '$ lps [options ...] {underline program-file} [otherArgs ...]',
        '$ lps {bold --help}'
      ]
    },
    {
      header: 'Options',
      optionList: buildOptionList(optionDefinitions, 'main')
    },
    {
      header: 'Other Arguments',
      content: [
        'The executed LPS program can receive arguments that appear after',
        'the {underline program-file} using the {bold lpsArgs/2} predicate.'
      ]
    },
    {
      header: 'Updating and more info',
      content: [
        'Use \'npm i -g lps-cli\' to update LPS CLI package.',
        'For bug reports and other contributions, please visit https://github.com/mauris/lps-cli'
      ]
    }
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
  process.exit(-1);
};

// process arguments
const options = commandLineArgs(optionDefinitions, { stopAtFirstUnknown: true });

Logger.verbose = options._all.verbose;
Logger.quiet = options._all.quiet;


if (options._all.help) {
  // if help option is set, show help
  showHelp();
} else if (options._all.version) {
  // if version option is set, show version.
  printVersion(options._all.verbose);
} else if (options._all.program) {
  // pass remaining unknowns terminated by '--' to LPS program
  let lpsProgramArgs = options._unknown || [];
  if (lpsProgramArgs.length > 0 && lpsProgramArgs[0] === '--') {
    lpsProgramArgs = lpsProgramArgs.slice(1);
  }
  
  // start program execution
  executeProgram(options._all.program, lpsProgramArgs)
    .then(() => {
      // if observer is enabled, start observation server.
      if (options._all['enable-observer']) {
        startObservationServer(options._all.port);
      }
    });
} else {
  // if there are no arguments set, show help anyway.
  showHelp();
}


