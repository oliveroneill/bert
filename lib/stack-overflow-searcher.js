"use strict";

/**
 * This class will hold API keys etc. when it gets smarter
 */
class StackOverflowSearcher {
  getUrlForRelevantAnswer(errorMessage) {
    return `http://stackoverflow.com/search?q=${errorMessage}`;
  }
}

module.exports = StackOverflowSearcher;
