"use strict";

const KEYPHRASES = [
  "error",
  "exited with status code 1",
  "stacktrace",
  "exception"
]

class ErrorParser {
  parse(str) {
    let parsedString = str.toLowerCase();
    if (parsedString.length == 0) return false;
    for (var i in KEYPHRASES) {
      var substr = KEYPHRASES[i];
      if (parsedString.indexOf(substr) > -1) return true;
    }
    return false;
  }
}

module.exports = ErrorParser;