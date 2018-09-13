# LPS CLI Toolsset

LPS is a logic-based programming language and production system developed by Robert Kowalski and Fariba Sadri at Imperial College London. This CLI toolset uses [lps.js](https://github.com/mauris/lps.js), the LPS runtime implemented in JavaScript, to enable access to LPS from the command line using Node.js.

This repository contains CLI tools that complement to the usage [lps.js](https://github.com/mauris/lps.js) on your system. To use lps.js in the browser context or as a Node.js library, see the main repository for instructions.

To access these CLI tools, you must have the Node.js and Node.js Package Manager `npm` installed on your system. Using `npm`, you can install LPS CLI Tools as a global package by running:

    $ npm install -g lps-cli
   
Once installed, you will have the following CLI commands available for use:

- `lps`: Execute LPS programs
- `lps-generate-spec`: Generate a test specification file based on the output from the execution of a LPS program. Executes LPS program.
- `lps-test`: Runs a LPS program and compares the output with a test specification file.
- `lps-p2p-tracker`: Starts a LPS P2P Peer Tracker service.

To get help for the options and usage of each CLI tool, use the `--help` option, e.g. `lps --help`.

# License

The LPS CLI Toolset package is release open source under the BSD 3-Clause License. The implementation depends on the LPS runtime [lps.js](https://github.com/mauris/lps.js). lps.js was implemented as part of Sam Yong's MSc Computer Science Individual Project and thesis at Imperial College London in 2018.
