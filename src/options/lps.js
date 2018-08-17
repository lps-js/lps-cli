module.exports = [
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