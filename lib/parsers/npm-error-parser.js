class NpmErrorParser {
  constructor() {
    this.errorLine = 0;
  }

  // returns true when it identifies an npm error
  evaluate(message) {
    let isNpmError = message.toLowerCase().startsWith("npm err!");
    if (!isNpmError) this.reset();
    return isNpmError;
  }

  parse(message) {
    let errorMessage = null;
    if (this.errorLine == 4) errorMessage = message;
    this.errorLine += 1;
    return errorMessage;
  }

  reset() {
    this.errorLine = 0;
  }
}

module.exports = NpmErrorParser;