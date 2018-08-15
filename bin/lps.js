#!/usr/bin/env node

const net = require('net');
const lps = require('lps');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const selfMeta = require('../package.json');
const Logger = require('../src/utility/Logger');

const optionDefinitions = [
  {
    name: 'observer',
    alias: 'o',
    type: Boolean,
    defaultValue: false,
    description: 'Turn on TCP observation server.',
    group: 'main'
  },
  {
    name: 'port',
    alias: 'p',
    type: Number,
    defaultValue: 8040,
    description: 'Set the port number of the observation server. Defaults to 8040. Set to 0 to use any available port.',
    group: 'main'
  },
  {
    name: 'verbose',
    alias: 'V',
    type: Boolean,
    defaultValue: false,
    description: 'Turn on debugging output.',
    group: 'main'
  },
  {
    name: 'quiet',
    alias: 'q',
    type: Boolean,
    defaultValue: false,
    description: 'Silence any output, overrides verbose.',
    group: 'main'
  },
  {
    name: 'program',
    type: String,
    defaultOption: true,
    group: 'hidden'
  },
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    defaultValue: false,
    description: 'Prints this usage guide.',
    group: 'main'
  },
  {
    name: 'version',
    alias: 'v',
    type: Boolean,
    defaultValue: false,
    description: 'Print the CLI tools package version. In verbose mode, the version of lps.js is printed.',
    group: 'main'
  }
];

const executeProgram = function executeProgram(file, programArgs) {
  Logger.log('Loading file ' + file);
  if (programArgs.length > 0) {
    Logger.log('Program Arguments: ' + programArgs);
  }
  
  let startTime = Date.now();
  return lps.loadFile(file)
    .then((engine) => {
      Logger.log('File loaded in ' + (Date.now() - startTime) + 'ms');
      Logger.log('Cycle Interval set to ' + engine.getCycleInterval() + 'ms');
      
      engine.on('postCycle', () => {
        Logger.log('[ Time ' + engine.getCurrentTime() + ' ] -------------- ' + engine.getLastCycleExecutionTime() + 'ms');
        Logger.log('Actions:\t' + engine.getLastCycleActions());
        Logger.log('Fluents:\t' + engine.getActiveFluents());
        Logger.log('Obs:    \t' + engine.getLastCycleObservations());
        Logger.log('Num Rules Fired: ' + engine.getNumLastCycleFiredRules());
        Logger.log('Num Rules Resolved: ' + engine.getNumLastCycleResolvedRules());
        Logger.log('Num Rules Failed: ' + engine.getNumLastCycleFailedRules());
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

const startObservationServer = function startObservationServer(portArg) {
  let port = portArg;
  const server = net.createServer((socket) => {
    socket.on('data', (data) => {
      let strData = data.toString('utf8');
      let literal = lps.literal(strData);
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

const buildOptionList = function buildOptionList(group) {
  return optionDefinitions.filter((def) => {
    return def.group === group;
  });
};

const showHelp = function showHelp() {
  const sections = [
    {
      header: 'lps',
      content: 'Logic Production Systems runtime environment in JavaScript'
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
      optionList: buildOptionList('main')
    },
    {
      header: 'Other Arguments',
      content: [
        'The executed LPS program can receive arguments that appear after',
        'the {underline program-file} using the {bold args/2} predicate.'
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

const options = commandLineArgs(optionDefinitions, { stopAtFirstUnknown: true });

Logger.verbose = options._all.verbose;
Logger.quiet = options._all.quiet;

if (options._all.help) {
  showHelp();
} else if (options._all.version) {
  if (options._all.verbose) {
    const versionLabel = 'lps-cli v' + selfMeta.version + '/ lps.js v' + lps.meta.version;
    console.log('Logic Production Systems (LPS)\n' + versionLabel);
  } else {
    console.log(selfMeta.version);
  }
} else if (options._all.program) {
  // pass remaining unknowns terminated by '--' to LPS program
  let lpsProgramArgs = options._unknown || [];
  if (lpsProgramArgs.length > 0 && lpsProgramArgs[0] === '--') {
    lpsProgramArgs = lpsProgramArgs.slice(1);
  }
  
  executeProgram(options._all.program, lpsProgramArgs)
    .then(() => {
      if (options['enable-observer']) {
        startObservationServer(options._all.port);
      }
    });
} else {
  showHelp();
}


