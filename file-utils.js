"use strict";

// imports
const fs = require('fs');
const path = require('path');

function createDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

class FileUtils {
  // generate new log to avoid name conflicts
  static generateNewLogFile(dir) {
    // ensure it ends with a trailing slash
    if (!dir.endsWith("/")) dir += "/";
    // create the log directory if it doesn't already exist
    createDirectory(dir);
    var index = 1;
    var fileName = 'log' + index;
    while (fs.existsSync(dir + fileName)) {
      index += 1;
      fileName = 'log' + index;
    }
    return dir + fileName;
  }

  // resolve ~ as the user's home directory
  static resolveHome(filePath) {
    if (filePath[0] === '~') {
      return path.join(process.env.HOME, filePath.slice(1));
    }
    return filePath;
  }

  // cleanup and delete file
  static deleteFile(filePath) {
    fs.unlinkSync(filePath);
  }

  // returns path to parent directory
  static getContainingDirectory(filePath) {
    return path.dirname(filePath);
  }
}

module.exports = FileUtils;
