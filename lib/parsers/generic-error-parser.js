class GenericErrorParser {
  constructor(errorPhrases) {
    this.errorPhrases = errorPhrases;
  }

  evaluate(message) {
    return this.findError(message) != null;
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
      for (var j in words) {
        let word = words[j];
        // only looking for words that end in error
        if (word.endsWith(substr)) return substr;
      }
    }
    return null;
  }
}

module.exports = GenericErrorParser;