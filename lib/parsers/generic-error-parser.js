"use strict";

const VariableNameFilter = require('./variable-name-filter.js');

/**
 * Deconstructed error. Broken up into error name
 * and message
 */
class ParsedError {
  constructor(name, message) {
    this.name = name;
    this.message = message;
  }
}

/**
 * Generic error parser used to identify specific keyphrases
 * within command output.
 *
 * This should be used as a last resort to find errors that don't
 * match a specific form
 */
class GenericErrorParser extends VariableNameFilter {
  evaluate(message) {
    // will always return true, since it should search every line
    // that doesn't match specific error parsers
    return true;
  }

  parse(message) {
    let error = this.findError(message);
    if (error === null) return null;
    return error.name + this.filter(error.message);
  }

  findError(message) {
    if (message.length == 0) return null;
    // split on all punctuation
    let words = message.split(/[^\w\s]|_/g);
    for (var i in this.errorPhrases) {
      var substr = this.errorPhrases[i];
      // Don't bother checking the very last phrase since we want to
      // pick up lines that start with a phrase followed by the reason.
      // If we match phrases that end in 'error' for example, we'll match
      // normal sentences that happen to end in error.
      for (var j = 0; j < words.length - 1; j++) {
        let word = words[j];
        // only looking for words that end in error
        if (word.endsWith(substr)) {
          let name = message.substr(0, message.indexOf(substr));
          let errorMessage = message.substr(message.indexOf(substr));
          return new ParsedError(name, errorMessage);
        }
      }
    }
    return null;
  }
}

module.exports = GenericErrorParser;
