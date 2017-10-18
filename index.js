#!/usr/bin/env node
"use strict";

// imports
const fileUtils = require('./file-utils');
const spawn = require('child_process').spawn;

function main() {
  console.log("Starting bert. Type 'exit' when you're done.");
  // TODO: run file watcher

  // TODO: add command line option to specify logs location
  let logDir = fileUtils.resolveHome('~/.bert/');
  let logPath = fileUtils.generateNewLogFile(logDir);

  // start `script`
  // we won't intercept the output to avoid causing user disruption
  spawn('script', ['-q', '-F', logPath], { stdio: 'inherit' });

  // TODO: wait for `script` exit and clean up log file
}

if (require.main === module) {
  main();
}
