"use strict";

const pos = require('pos');

// Phrases from error message that shouldn't be removed
const NOUNS_TO_KEEP = [
  'variable',
  'method',
  'function',
  'class',
  'syntax',
  'index',
  'directory',
  'file'
];

/**
 * VariableNameFilter will filter out variable names by
 * using POS tagging
 */
class VariableNameFilter {
  /**
   * @param errorPhrases the phrases that identify error
   */
  constructor(errorPhrases) {
    this.errorPhrases = errorPhrases;
  }

  filter(errorMessage) {
    // Use POS tagging to find nouns which should equate to variable
    // or file names
    var words = new pos.Lexer().lex(errorMessage);
    var tagger = new pos.Tagger();
    var taggedWords = tagger.tag(words);
    // Go through each word and remove names so that we can then search
    // using a generic error
    for (var i in taggedWords) {
      var taggedWord = taggedWords[i];
      var word = taggedWord[0];
      var tag = taggedWord[1];
      // if its a noun or personal pronoun
      let isVariableName = (tag == 'NN') || (tag == 'PRP');
      // If we've found a noun that isn't an error name
      if ((isVariableName) && (word.length > 0) && (!this.isWhiteListed(word))) {
        if (/[,.?\-\/]/.test(word)) {
          continue;
        }
        errorMessage = errorMessage.replace(new RegExp('\\b'+word+'\\b',"i"), '');
      }
    }
    return errorMessage;
  }

  /**
   * Will return true if the phrase contains any words or phrases that
   * we expected to be useful in the message
   */
  isWhiteListed(word) {
    word = word.toLowerCase();
    for (var i in this.errorPhrases) {
      if (word.indexOf(this.errorPhrases[i]) > -1) return true;
    }
    for (var i in NOUNS_TO_KEEP) {
      if (word == NOUNS_TO_KEEP[i]) return true;
    }
    return false;
  }
}

module.exports = VariableNameFilter;
