"use strict";

const pos = require('pos');

const KEYPHRASES = [
  "error",
  "stacktrace",
  "exception"
];

const NOUNS_TO_KEEP = [
  'variable',
  'method',
  'function',
  'class'
]

class ErrorParser {
  /**
   * @param str - a new line of input
   * @returns parsed error - this may be multiple lines from previously
   * received input
   */
  parse(str) {
    // if this line isn't an output line then we should ignore it
    if (this.isInputLine(str)) return null;
    // keep a copy of the string before lowercase, so we can keep the parsed
    // string with its capitalisation
    var rtn = str;
    var parsedString = str.toLowerCase();
    if (!this.isError(parsedString)) return null;
    // Use POS tagging to find nouns which should equate to variable
    // or file names
    var words = new pos.Lexer().lex(parsedString);
    var tagger = new pos.Tagger();
    var taggedWords = tagger.tag(words);
    // Go through each word and remove names so that we can then search
    // using a generic error
    for (var i in taggedWords) {
      var taggedWord = taggedWords[i];
      var word = taggedWord[0];
      var tag = taggedWord[1];
      // If we've found a noun that isn't an error name
      if ((tag == 'NN') && (word.length > 0) && (!this.isWhiteListed(word))) {
        // Remove it from the string. We remove the following space as well
        // for readability
        // TODO: figure out how to match boundary as well, so we don't end up
        // with loose punctuation in return value
        try {
          // We call replace on the original string to maintain case
          rtn = rtn.replace(new RegExp('\\b'+word+'\\b',"i"), '');
        } catch (e) {
          // There are cases where the parsed words return invalid regex. In
          // this case we'll ignore those words
        }
      }
    }
    // remove empty quotes since the variable names may be in quotes
    rtn = rtn.replace(new RegExp("\'\'", 'g'), '');
    // remove unnecessary spaces that were left during replace
    rtn = rtn.replace(/\s\s+/g, ' ');
    return rtn;
  }

  isError(str) {
    if (str.length == 0) return false;
    for (var i in KEYPHRASES) {
      var substr = KEYPHRASES[i];
      if (str.indexOf(substr) > -1) return true;
    }
    return false;
  }

  /**
   * Will return true if the phrase contains any words or phrases that
   * we expected to be useful in the message
   */
  isWhiteListed(phrase) {
    for (var i in KEYPHRASES) {
      if (phrase.indexOf(KEYPHRASES[i]) > -1) return true;
    }
    for (var i in NOUNS_TO_KEEP) {
      if (phrase == NOUNS_TO_KEEP[i]) return true;
    }
    return false;
  }

  /**
   * TODO: should the error parser be filtering this or should we also
   * have a `script` parser that determines legitimate output and filters
   * out backspaces etc.?
   */
  isInputLine(command) {
    // TODO: what about lines with dollar signs in the output
    return command.indexOf("$") > -1;
  }
}

module.exports = ErrorParser;
