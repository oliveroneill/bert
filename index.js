#!/usr/bin/env node
console.log("Starting bert. Type 'exit' when you're done.")
// TODO: run file watcher

// TODO: add command line option to specify logs location
let logDir = resolveHome('~/.bert/');

// create the log directory if it doesn't already exist
createDirectory(logDir);

// start `script`
var spawn = require('child_process').spawn;
// we won't intercept the output to avoid causing user disruption
spawn('script', ['-F', logDir + generateNewLogName()], { stdio: 'inherit' });

// generate new log to avoid name conflicts
function generateNewLogName() {
    // TODO: check directory and add increment for each new session
    return 'log';
}

function createDirectory(dir) {
    const fs = require('fs');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

// resolve ~ as the user's home directory
function resolveHome(filepath) {
    const path = require('path');
    if (filepath[0] === '~') {
        return path.join(process.env.HOME, filepath.slice(1));
    }
    return filepath;
}
