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
    .argv;

const fileUtils = require('./lib/file-utils');
const FileWatcher = require('./lib/file-watcher');

function main() {
  console.log("Starting bert. Type 'exit' when you're done.");

  let logDir = fileUtils.resolveHome(argv.dir);
  let logPath = fileUtils.generateNewLogFile(logDir);

  let watcher = new FileWatcher(logPath);
  watcher.on('line', (line) => {
    // TODO: parse line here
  });

  // script will be null until it's started
  var script = null;
  // create cleanup function for errors and on close
  function cleanup() {
    if (script !== null) {
      script.kill();
    }
    watcher.cleanup();
    fileUtils.deleteFile(logPath);
  }

  watcher.on('error', (e) => {
    console.error(e);
    cleanup();
  });

  // TODO: this is a temporary fix for this
  // issue: https://github.com/nodejs/node/issues/12101
  process.stdin.setRawMode(true);
  process.stdin.setRawMode(false);

  // start `script`
  // we won't intercept the output to avoid causing user disruption
  script = spawn('script', ['-q', '-F', logPath], { stdio: 'inherit' });
  // cleanup here
  script.on('close', (code) => {
    cleanup();
  });
}

if (require.main === module) {
  main();
}
