const assert = require('assert');

var ErrorParser = require("../lib/error-parser.js");

/**
 * The first test in this suite will take some time to run, this is because
 * its loading the `pos` library
 */
describe('ErrorParser', function() {
  describe('parse', function() {
    it('should flag errors correctly', function() {
      // given
      let message = "ERROR: x is undefined";
      let parser = new ErrorParser();
      // when
      let result = parser.parse(message);
      // then
      let expected = "ERROR: is undefined";
      assert.equal(result, expected);
    });

    it('should flag a real stacktrace correctly', function() {
      // given
      let message = "2015-05-29T09:35:09.793Z - error: [api] TypeError: Cannot call method 'logger' of undefined stack=TypeError: Cannot call method 'logger' of undefined";
      let parser = new ErrorParser();
      // when
      let result = parser.parse(message);
      // then
      let expected = "2015-05-29T09:35:09.793Z - error: [api] TypeError: Cannot call method of undefined stack=TypeError: Cannot call method of undefined";
      assert.equal(result, expected);
    });

    it('should not flag empty lines', function() {
      // given
      let message = "";
      let parser = new ErrorParser();
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, null);
    });

    it('should ignore input lines', function() {
      // given
      let message = "username-1$ ls";
      let parser = new ErrorParser();
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, null);
    });

    it('should ignore input lines even if they contain the word error', function() {
      // given
      let message = "username-1$ input line with the word error";
      let parser = new ErrorParser();
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, null);
    });

    it('should not flag white space', function() {
      // given
      let message = `      

          \r\n
      `;
      let parser = new ErrorParser();
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, null);
    });

    it('should not flag general output', function() {
      // given
      let message = "Normal output with nothing weird about it";
      let parser = new ErrorParser();
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, null);
    });

  });
});
