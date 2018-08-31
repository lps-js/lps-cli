#!/usr/bin/env node
const net = require('net');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const Logger = require('../src/utility/Logger');
const buildOptionList = require('../src/utility/buildOptionList');
const optionDefinitions = require('../src/options/tracker');
const printVersion = require('../src/utility/printVersion');

function startTrackingServer(port) {
  let nodes = [];
  let addresses = [];

  const server = net.createServer((socket) => {
    Logger.log('[Info] ' + socket.remoteAddress + ' has connected.');
    
    socket.on('data', (buf) => {
      let data;
      try {
        data = JSON.parse(buf.toString('utf8'));
      } catch (e) {
        Logger.error('[Error] Invalid data received.')
        return;
      }
      if (data === undefined) {
        return;
      }
      if (data.register !== undefined) {
        let entry = [socket.remoteAddress, data.register];
        socket.write(JSON.stringify({ peers: addresses }));
        nodes.forEach((node) => {
          node.write(JSON.stringify({ newNode: entry }))
        });
        nodes.push(socket);
        addresses.push(entry);
        Logger.log('[Info] ' + entry + ' has registered.');
      }
    });
    
    socket.on('end', () => {
      let indices = [];
      
      // announce node exit
      nodes.forEach((node, idx) => {
        if (node === socket) {
          indices.push(idx);
          return;
        }
      });
      
      indices.forEach((index) => {
        let address = addresses[index];
        nodes = nodes.slice(0, index).concat(nodes.slice(index + 1));
        addresses = addresses.slice(0, index).concat(addresses.slice(index + 1));
        
        nodes.forEach((node) => {
          node.write(JSON.stringify({ removeNode: address }));
        });
      });
      
      Logger.log('[Info] ' + socket.remoteAddress + ' has left.');
    });
  });

  server.on('error', (err) => {
    Logger.error('[Error] ' + err);
  });
  
  server.on('listening', () => {
    Logger.log('[Info] P2P Tracking service started on ' + JSON.stringify(server.address()));
  });
  
  server.listen(port);
}

function showHelp() {
  const sections = [
    {
      header: 'lps-p2p-tracker',
      content: [
        'LPS Peer-to-peer (P2P) Presence Tracking Service',
        'Note that this tool needs to be used with the {underline p2p} module in lps.js'
      ]
    },
    {
      header: 'Synopsis',
      content: [
        '$ lps-p2p-tracker [options ...]',
        '$ lps {bold --help}'
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
} else {
  startTrackingServer(options._all.port);
}


