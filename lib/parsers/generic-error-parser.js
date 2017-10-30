/**
 * Generic error parser used to identify specific keyphrases
 * within command output.
 *
 * This should be used as a last resort to find errors that don't
 * match a specific form
 */
class GenericErrorParser {
  /**
   * @param errorPhrases the phrases that should be checked against to
   * find an error
   */
  constructor(errorPhrases) {
    this.errorPhrases = errorPhrases;
  }

  evaluate(message) {
    // will always return true, since it should search every line
    // that doesn't match specific error parsers
    return true;
  }

  parse(message) {
    return this.findError(message);
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
        if (word.endsWith(substr)) return substr;
      }
    }
    return null;
  }
}

module.exports = GenericErrorParser;