#!/usr/bin/env node

const net = require('net');
const lps = require('lps');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const selfMeta = require('../package.json');

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
  console.log('Loading file\t' + file);
  let startTime = Date.now();
  return lps.loadFile(file)
    .then((engine) => {
      console.log('File loaded in ' + (Date.now() - startTime) + 'ms');
      console.log('Cycle Interval set to ' + engine.getCycleInterval() + 'ms');
      
      engine.on('postCycle', () => {
        console.log('[ Time ' + engine.getCurrentTime() + ' ] -------------- ' + engine.getLastCycleExecutionTime() + 'ms');
        console.log('Actions:\t' + engine.getLastCycleActions());
        console.log('Fluents:\t' + engine.getActiveFluents());
        console.log('Obs:    \t' + engine.getLastCycleObservations());
        console.log('Num Rules Fired: ' + engine.getNumLastCycleFiredRules());
        console.log('Num Rules Resolved: ' + engine.getNumLastCycleResolvedRules());
        console.log('Num Rules Failed: ' + engine.getNumLastCycleFailedRules());
        console.log('');
        console.log('');
      });
      engine.on('done', () => {
        console.log('Execution complete in ' + (Date.now() - startTime) + 'ms');
        process.exit(0);
      });
      
      engine.on('error', (err) => {
        console.error(err);
        process.exit(1);
      });
      
      startTime = Date.now();    
      engine.run();

      return Promise.resolve(engine);
    })
    .catch((err) => {
      console.log('LPS Execution Halted');
      console.log('An error has occurred');
      console.log(err);
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
    console.log(err);
  });
  server.listen(port, function() {
    console.log('Observation server listening on port ' + server.address().port);
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
        '$ lps [{bold --observer}] [-p {italic port}] [options ...] {underline program-file} [-- ...]',
        '$ lps {bold --help}'
      ]
    },
    {
      header: 'Options',
      optionList: buildOptionList('main')
    }
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
  process.exit(-1);
};

const options = commandLineArgs(optionDefinitions, { stopAtFirstUnknown: true })._all;

if (options.help) {
  showHelp();
} else if (options.version) {
  if (options.verbose) {
    const versionLabel = 'lps-cli v' + selfMeta.version + '/ lps.js v' + lps.meta.version;
    console.log('Logic Production Systems (LPS)\n' + versionLabel);
  } else {
    console.log(selfMeta.version);
  }
} else if (options.program) {
  // pass remaining unknowns terminated by '--' to LPS program
  let lpsProgramArgs = options._unknown || [];
  if (lpsProgramArgs.length > 0 && lpsProgramArgs[0] === '--') {
    lpsProgramArgs = lpsProgramArgs.slice(1);
  }
  
  executeProgram(options.program, lpsProgramArgs)
    .then(() => {
      if (options['enable-observer']) {
        startObservationServer(options.port);
      }
    });
} else {
  showHelp();
}


