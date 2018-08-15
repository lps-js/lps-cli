# LPS CLI Tools

LPS is a logic-based programming language and production system developed by Robert Kowalski and Fariba Sadri at Imperial College London. [lps.js](https://github.com/mauris/lps.js) is the LPS runtime implemented in JavaScript.

This repository contains CLI tools that compliment [lps.js](https://github.com/mauris/lps.js). To use lps.js in the browser context or as a Node.js library, see the main repository for instructions.

To access these CLI tools, you must have the Node.js Package Manager `npm` installed on your system. Using `npm`, you can install LPS CLI Tools as a global package by running:

    $ npm install -g lps-cli
   
Once installed, you will have the following CLI commands available for use:

- `lps`: Execute LPS programs
- `lps-generate-spec`: Generate a test specification file based on the output from the execution of a LPS program. Executes LPS program.
- `lps-test`: Runs a LPS program and compares the output with a test specification file.
- `lps-p2p-tracker`: Starts a LPS P2P Peer Tracker service.

# License

The LPS CLI Tools is open source and licensed under the BSD 3-Clause. The implementation depends on the LPS runtime [lps.js](https://github.com/mauris/lps.js). lps.js was implemented as part of Sam Yong's MSc Computer Science Individual Project and thesis at Imperial College London in 2018.