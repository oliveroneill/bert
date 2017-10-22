"use strict";

const KEYPHRASES = [
  "error",
  "exited with status code 1",
  "stacktrace",
  "exception"
]

class ErrorParser {
  /**
   * @param str - a new line of input
   * @returns parsed error - this may be multiple lines from previously
   * received input
   */
  parse(str) {
    let parsedString = str.toLowerCase();
    if (parsedString.length == 0) return null;
    for (var i in KEYPHRASES) {
      var substr = KEYPHRASES[i];
      if (parsedString.indexOf(substr) > -1) return str;
    }
    return null;
  }
}

module.exports = ErrorParser;