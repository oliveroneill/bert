"use strict";

const pos = require('pos');

// Phrases that will signify an error
const KEYPHRASES = [
  "error",
  "stacktrace",
  "exception",
  "err"
];

// Phrases from error message that shouldn't be removed
const NOUNS_TO_KEEP = [
  'variable',
  'method',
  'function',
  'class',
  'syntax',
  'index'
];

// Comamnds that should not output errors
const BLACKLISTED_COMMANDS = [
  'ls'
];

// Phrases that should be removed from error message
const PHRASES_TO_REMOVE = [
  /in [a-zA-Z0-9_\.\/]+ on line \d/
];

/**
 * This receives all terminal input and output, for this reason
 * it's assumed that the first line is an input line. This is used to then
 * determine the username and later input lines
 */
class ErrorParser {
  constructor() {
    // Used to identify input lines from terminal output
    this._username = null;

    // Used to indicate whether or not we're watching input
    this._shouldParseOutput = true;
  }
  /**
   * @param str - a new line of input
   * @returns parsed error - this may be multiple lines from previously
   * received input
   */
  parse(str) {
    if (str.length === 0) return null;
    // if this line is an input line, we should check if the command is a command to ignore, and start or stop tracking as appropriate
    if (this.isInputLine(str)) {
      let command = this.getCommandForInputLine(str);
      this._shouldParseOutput = !this.isBlackListed(command);
      return null;
    }
    // ignore if we're currently not tracking output because of a blacklisted command
    if (!this._shouldParseOutput) return null;
    // keep a copy of the string before lowercase, so we can keep the parsed
    // string with its capitalisation
    var rtn = str;
    var parsedString = str.toLowerCase();
    let matchedPhrase = this.findError(parsedString);
    if (matchedPhrase === null) return null;
    // TODO: we have to do this twice. It might just be easier to return the
    // message in lower case
    rtn = this.removeUnnecessaryPhrases(rtn);
    parsedString = this.removeUnnecessaryPhrases(parsedString);
    // we will remove error name from the string
    let errorNameLength = parsedString.indexOf(matchedPhrase) + matchedPhrase.length;
    parsedString = parsedString.substring(errorNameLength);
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
      let isVariableName = (tag == 'NN') || (tag == 'PRP');
      // If we've found a noun that isn't an error name
      if ((isVariableName) && (word.length > 0) && (!this.isWhiteListed(word))) {
        if (/[,.?\-\/]/.test(word)) {
          continue;
        }
        // Remove it from the string. We remove the following space as well
        // for readability
        try {
          // We call replace on the original string to maintain case
          rtn = rtn.replace(new RegExp('\\b'+word+'\\b',"i"), '');
        } catch (e) {
          // There are cases where the parsed words return invalid regex. In
          // this case we'll ignore those words
        }
      }
    }
    // remove control characters from `script`
    rtn = rtn.replace(new RegExp(/\[[0-9;]*[m|K]/, 'g'), '');
    // remove empty quotes since the variable names may be in quotes
    rtn = rtn.replace(new RegExp("\'\'", 'g'), '');
    // remove unnecessary spaces that were left during replace
    rtn = rtn.replace(/\s\s+/g, ' ');
    rtn = rtn.trim();
    return rtn;
  }

  findError(str) {
    if (str.length == 0) return null;
    // split on all punctuation
    let words = str.split(/[^\w\s]|_/g);
    for (var i in KEYPHRASES) {
      var substr = KEYPHRASES[i];
      for (var j in words) {
        let word = words[j];
        // only looking for words that end in error
        if (word.endsWith(substr)) return substr;
      }
    }
    return null;
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
    // We assume that the first line with a dollar sign in it is an input
    // line. Therefore we can get the username
    if (this._username === null) {
      if (command.indexOf("$") === -1) return false;
      this._username = command.substring(0, command.indexOf("$") + 1);
      return true;
    }
    // If it starts with the stored username then its an input line
    return command.indexOf(this._username) == 0;
  }

  /**
   * Will return true if the command matches any of the blacklisted commands
   * to ignore
   */
  isBlackListed(command) {
    if (BLACKLISTED_COMMANDS.indexOf(command) !== -1) return true;
    return false;
  }

  /**
   * Returns the command given of an input line, e.g. "username$ ls -la" -> "ls -la"
   * Optionally return the whole command or just the base command
   */
  getCommandForInputLine(line, getBaseCommand = true) {
    // We assume that the first line with a dollar sign in it is an input
    // line. Therefore we can get the username
    let wholeCommand = line.substring(line.indexOf("$") + 1).trim();

    return getBaseCommand ? wholeCommand.split(" ")[0] : wholeCommand;
  }

  removeUnnecessaryPhrases(message) {
    for (var i in PHRASES_TO_REMOVE) {
      let phrase = PHRASES_TO_REMOVE[i];
      message = message.replace(new RegExp(phrase,"i"), '');
    }
    return message;
  }
}

module.exports = ErrorParser;
