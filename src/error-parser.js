"use strict";

const pos = require('pos');

const GenericErrorParser = require('./parsers/generic-error-parser.js');
const NpmErrorParser = require('./parsers/npm-error-parser.js');

// Comamnds that should not output errors
const BLACKLISTED_COMMANDS = [
  'ls'
];

// Phrases that should be removed from error message
const PHRASES_TO_REMOVE = [
  /in [a-zA-Z0-9_\.\/]+ on line \d/,
  // golang file name and line number
  /[a-zA-Z_\.\/]+:\d+:\d+: /,
  // timestamp format
  // TODO: need something more general
  /\d+\-\d+\-\d+\w+\d+\:\d+\:\d+\.\d+\w/
];

// Phrases that will signify an error
const KEYPHRASES = [
  "error",
  "stacktrace",
  "exception",
  "err",
  "undefined",
  "fatal"
];

// Use these to identify multiline errors and parse a single error back
// The order here is important. The generic parser should be at the bottom
// and used if we cannot match specific errors
const PARSERS = [
  new NpmErrorParser(),
  new GenericErrorParser(KEYPHRASES)
];

/**
 * This receives all terminal input and output, for this reason
 * it's assumed that the first line is an input line. This is used to then
 * determine the username and later input lines
 */
class ErrorParser {
  // Used to identify input lines from terminal output
  _username: ?string;
  _shouldParseOutput: bool;

  constructor() {
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
    str = this.preprocess(str);
    // keep a copy of the string before lowercase, so we can keep the parsed
    // string with its capitalisation
    var parsedString = str.toLowerCase();
    // run through each parser to find relevant error
    for (var i in PARSERS) {
      let parser = PARSERS[i];
      // evaluate will return true if this matches the expected type of error
      if (!parser.evaluate(parsedString)) continue;
      // parse may return null if we have not reached the error line yet.
      // this allows us to identify an error across multiple lines
      let parsedError = parser.parse(parsedString);
      // we shouldn't try the other parsers if we evaluate to true, as
      // this parser is currently searching
      if (parsedError === null) return null;
      return this.cleanup(parsedError);
    }
    return null;
  }

  preprocess(msg) {
    msg = this.removeUnnecessaryPhrases(msg);
    // remove file paths to avoid false positives
    msg = this.removeFilePaths(msg);
    msg = this.cleanupScriptOutput(msg);
    return msg;
  }

  cleanup(msg) {
    // remove empty quotes since the variable names may be in quotes
    msg = msg.replace(/\'\'/g, '');
    // remove unnecessary spaces that were left during replace
    msg = msg.replace(/\s\s+/g, ' ');
    // remove trailing dots, caused by something like `parser.parse` being
    // cleared
    msg = msg.replace(/\s\.(\s|$)/g, ' ');
    // remove leading dashes
    msg = msg.replace(/^\s*\-/i, '');
    msg = msg.trim();
    return msg;
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

  removeFilePaths(message) {
    let regex = new RegExp(/(\/*[a-zA-Z0-9_.-]+\/)+[a-zA-Z0-9_.-]+\.[a-zA-Z0-9_.-]+/g);
    message = message.replace(regex, '');
    return message;
  }

  cleanupScriptOutput(message) {
    // remove control characters from `script`
    message = message.replace(new RegExp(/\[[0-9;]*[m|K]/g), '');
    // delete invisible characters
    message = message.replace(/[^A-Za-z0-9\s-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, '');
    return message;
  }
}

module.exports = ErrorParser;
