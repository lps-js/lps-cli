module.exports = [
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
    name: 'out',
    alias: 'o',
    defaultValue: null,
    type: String,
    description: 'Set the output file',
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
    description: 'Print the CLI tools package version. In verbose mode, the version of lps.js is printed.',
    group: 'main'
  }
];