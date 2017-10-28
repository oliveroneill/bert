const NPM_ERROR_PREFIX = "npm err!";
// the useful error message seems to occur on the 5th line
// (this value is zero indexed)
const NPM_ERROR_MESSAGE_LINE_NUMBER = 4;

/**
 * Used to read NPM errors and identify the error message across
 * mutliple lines
 */
class NpmErrorParser {
  constructor() {
    // keep track of the line we're up to
    this.errorLine = 0;
  }

  /*
   * Used to determine whether this parser should be used to evaluate
   * the line. This will return true for any line within a multi-line npm
   * error.
   *
   * @param message the line to check
   * @return true when it identifies an npm error line
   */
  evaluate(message) {
    let isNpmError = message.toLowerCase().startsWith(NPM_ERROR_PREFIX);
    // if this isn't an npm error then reset the line counter
    if (!isNpmError) this.reset();
    return isNpmError;
  }

  /**
   * Use this function to pass each line of an error to the parser
   * and eventually receive an output. It will return null until it
   * has enough information to pass a useful error message
   *
   * @param message the line to parse
   * @return a parsed message or null if we don't have enough information
   * yet
   */
  parse(message) {
    let errorMessage = null;
    if (this.errorLine == NPM_ERROR_MESSAGE_LINE_NUMBER) {
      errorMessage = message;
    }
    this.errorLine += 1;
    return errorMessage;
  }

  reset() {
    this.errorLine = 0;
  }
}

module.exports = NpmErrorParser;