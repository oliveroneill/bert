"use strict";
// @flow

/**
 * This class will eventually be smarter and access the StackOverflow
 * API and point to direct answers
 */
class StackOverflowSearcher {
  getUrlForRelevantAnswer(errorMessage: string): string {
    return encodeURI(`http://stackoverflow.com/search?q=${errorMessage}`);
  }
}

module.exports = StackOverflowSearcher;
