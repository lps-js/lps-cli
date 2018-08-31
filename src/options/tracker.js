module.exports = [
  {
    name: 'port',
    alias: 'p',
    type: Number,
    defaultValue: 4100,
    description: 'Set the port number of the observation server. Defaults to 4100. Set to 0 to use any available port.',
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
    description: 'Print the CLI tools package version. In verbose mode, the version of lps.js used by the CLI tools package is printed.',
    group: 'main'
  }
];