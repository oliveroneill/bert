#!/usr/bin/env node
"use strict";

const DEFAULT_DIR = '~/.bert/';
const CMD_OPTIONS = {
  'dir': {
    describe: 'Bert will store logs in this directory while running',
    default: DEFAULT_DIR,
    type: 'string'
  }
};

// imports
const spawn = require('child_process').spawn;
// Command line config
const argv = require('yargs')
    .usage('Usage: bert [options]')
    .options(CMD_OPTIONS)
    .help('h')
    .argv

const fileUtils = require('./file-utils');
const FileWatcher = require('./file-watcher');

function main() {
  console.log("Starting bert. Type 'exit' when you're done.");

  let logDir = fileUtils.resolveHome(argv.dir);
  let logPath = fileUtils.generateNewLogFile(logDir);

  let watcher = new FileWatcher();
  watcher.watch(logPath, function(line) {
    // TODO: parse line here
  });

  // start `script`
  // we won't intercept the output to avoid causing user disruption
  let script = spawn('script', ['-q', '-F', logPath], { stdio: 'inherit' });

  // cleanup here
  script.on('close', (code) => {
    watcher.cleanup();
    fileUtils.deleteFile(logPath);
  });
}

if (require.main === module) {
  main();
}
