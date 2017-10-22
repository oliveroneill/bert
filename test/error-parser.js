const assert = require('assert');

var ErrorParser = require("../lib/error-parser.js");

/**
 * The first test in this suite will take some time to run, this is because
 * its loading the `pos` library
 */
describe('ErrorParser', function() {
  describe('parse', function() {
    let parser = new ErrorParser();
    let username = 'test-username';
    beforeEach(function() {
      // the parser expects the first line to be an input line
      parser.parse(`${username}$`);
    });

    it('should flag errors correctly', function() {
      // given
      let message = "ERROR: x is undefined";
      // when
      let result = parser.parse(message);
      // then
      let expected = "ERROR: is undefined";
      assert.equal(result, expected);
    });

    it('should flag a real stacktrace correctly', function() {
      // given
      let message = "2015-05-29T09:35:09.793Z - error: [api] TypeError: Cannot call method 'logger' of undefined stack=TypeError: Cannot call method 'logger' of undefined";
      // when
      let result = parser.parse(message);
      // then
      let expected = "2015-05-29T09:35:09.793Z - error: [api] TypeError: Cannot call method of undefined stack=TypeError: Cannot call method of undefined";
      assert.equal(result, expected);
    });

    it('should flag errors when they start with a different username', function() {
      // given
      let message = "username2$ error";
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, message);
    });

    it('should not flag empty lines', function() {
      // given
      let message = "";
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, null);
    });

    it('should not flag input lines', function() {
      // given
      let message = `${username}$ ls`;
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, null);
    });

    it('should not flag input lines even if they contain the word error', function() {
      // given
      let message = `${username}$ input line with the word error`;
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, null);
    });

    it('should not flag input lines where the username has error in it', function() {
      // given
      let message = "error-username$ input line";
      parser = new ErrorParser();
      // when
      parser.parse('error-username$');
      let result = parser.parse(message);
      // then
      assert.equal(result, null);
    });

    it('should not flag white space', function() {
      // given
      let message = `      

          \r\n
      `;
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, null);
    });

    it('should not flag general output', function() {
      // given
      let message = "Normal output with nothing weird about it";
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, null);
    });

  });
});
