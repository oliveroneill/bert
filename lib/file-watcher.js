"use strict";

// imports - these cannot be constants due to being tested with rewire
// see https://github.com/jhnns/rewire#limitations
var Tail = require('tail').Tail;
var chokidar = require('chokidar');

const fileUtils = require('./file-utils');

class FileWatcher {
  constructor() {
    // tail will be set when the file is created
    this._tail = null;
    // this is set when `watch` is called
    this._watcher = null;
  }

  watch(filePath, onNewLine) {
    // cleanup in case we were previously watching something else
    this.cleanup();
    let dir = fileUtils.getContainingDirectory(filePath);
    // wait for the log file to be created, as we can't guarantee it exists
    // yet
    this._watcher = chokidar.watch(dir);
    this._watcher.on('add', (path) => {
      // ignore other files
      if (path !== filePath) return;
      // watch for new lines in the file
      this._tail = new Tail(path);
      // TODO: this crashes when file is deleted while bert is running
      this._tail.on("line", function(data) {
        // notify each line change
        onNewLine(data);
      });
      // stop watcher since the file we waited for was created
      this._watcher.close();
    });
  }

  cleanup() {
    if (this._watcher !== null) {
      // this can be called multiple times with no effect
      this._watcher.close();
    }
    if (this._tail !== null) {
      this._tail.unwatch();
    }
  }
}

module.exports = FileWatcher;