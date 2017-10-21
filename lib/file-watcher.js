"use strict";

// imports - these cannot be constants due to being tested with rewire
// see https://github.com/jhnns/rewire#limitations
var Tail = require('tail').Tail;
var chokidar = require('chokidar');
const EventEmitter = require('events').EventEmitter

const fileUtils = require('./file-utils');

class FileWatcher extends EventEmitter {
  /**
  * @param filePath - the file to watch
  * @param fileExists - whether the file exists. This determines whether
  * the watcher will wait for the file to be created or not
  */
  constructor(filePath, fileExists=false) {
    super();
    this._path = filePath;
    // tail will be set when the file is created
    this._tail = null;
    // if the file exists then we don't need to use chokidar
    if (fileExists) {
      this._watchLineChanges(filePath);
      return;
    }
    // if the file doesn't exist yet we must watch the parent directory
    // for changes
    let dir = fileUtils.getContainingDirectory(this._path);
    // wait for the log file to be created, as we can't guarantee it exists
    // yet
    this._watcher = chokidar.watch(dir);
    this._watcher.on('add', (path) => {
      // ignore other files
      if (path !== this._path) return;
      this._watchLineChanges(path);
      // stop watcher since the file we waited for was created
      this._watcher.close();
    });
    this._watcher.on('error', (e) => {
      this.emit('error', e);
    })
  }

  _watchLineChanges(path) {
    // watch for new lines in the file
    this._tail = new Tail(path);
    // TODO: this crashes when file is deleted while bert is running
    this._tail.on("line", (data) => {
      // notify each line change
      this.emit('line', data);
    });
    this._tail.on('error', (e) => {
      this.emit('error', e);
    });
  }

  cleanup() {
    // this can be called multiple times with no effect
    this._watcher.close();
    if (this._tail !== null) {
      this._tail.unwatch();
    }
  }
}

module.exports = FileWatcher;
