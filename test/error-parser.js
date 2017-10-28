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
      let message = "username2$ error: is not defined";
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, message);
    });

    it('should flag errors from golang correctly', function() {
      // given
      let message = "tripwatcher/main.go:57:25: undefined: config.LodadConf";
      // when
      let result = parser.parse(message);
      // then
      let expected = "undefined:";
      assert.equal(result, expected);
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
      let message = `${username}$ test_command`;
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

    it('should not flag error output when an input line contained a blacklisted command', function() {
      // given
      let message = `${username}$ ls -la`;
      parser = new ErrorParser();
      // when
      let result = parser.parse(message);
      assert.equal(result, null);
      result = parser.parse('-rw-r--r--    1 username  groupname      0 23 Oct 00:00 error.txt');
      // then
      assert.equal(result, null);
    });

    it('should resume flagging error output after a blacklisted command when a new input is received', function() {
      // send blacklisted input - we don't care about the result, this has already been tested
      let message = `${username}$ ls -la`;
      let result = parser.parse(message);
      // check error output while blacklisted command is running
      message = '-rw-r--r--    1 username  groupname      0 23 Oct 00:00 error.txt'
      result = parser.parse(message);
      assert.equal(result, null);
      // send non-blacklisted input - we don't care about the result, this has already been tested
      message = `${username}$ some_other_command`;
      result = parser.parse(message);
      // ensure error output is now tracked again
      message = "ERROR: x is not defined";
      result = parser.parse(message);
      let expected = "ERROR: is not defined";
      assert.equal(result, expected);
    });

    it('should remove file paths from errors', function() {
      // given
      let message = "PHP Parse error:  syntax error, unexpected ';' in /Users/tallytarik/work/bert/test.php on line 1";
      // when
      let result = parser.parse(message);
      // then
      let expected = "PHP Parse error: syntax error, unexpected ';'";
      assert.equal(result, expected);
    });

    it('should pick out error message from multi-line error', function() {
      // given
      let messages = [
        "npm ERR! path /Users/oliveroneill04/git/package.json",
        "npm ERR! code ENOENT",
        "npm ERR! errno -2",
        "npm ERR! syscall open",
        "npm ERR! enoent ENOENT: no such file or directory, open '/Users/oliveroneill04/git/package.json'",
        "npm ERR! enoent This is related to npm not being able to find a file.",
        "npm ERR! enoent",
        "npm ERR! A complete log of this run can be found in:",
        "npm ERR!     /Users/oliveroneill04/.npm/_logs/2017-10-27T07_37_44_067Z-debug.log"
      ];
      let expectedErrorIndex = 4;
      // TODO: remove file path from this
      let expected = "npm ERR! enoent ENOENT: no such file or directory, open";
      // then
      for (var i = 0; i < messages.length; i++) {
        let result = parser.parse(messages[i]);
        if (i === expectedErrorIndex) {
          assert.equal(result, expected);
          continue;
        }
        assert.equal(result, null);
      }
    });

    it('should remove file paths from error message', function() {
      //given
      let message = "Error: no such file or directory, open '/Users/oliveroneill04/git/error-parser.js'";
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, "Error: no such file or directory, open");
    });

    it('should keep the error message name', function() {
      // given
      let message = "Index out of range error: index i is 3 when length is 1";
      // when
      let result = parser.parse(message);
      // then
      let expected = "Index out of range error: index is 3 when is 1";
      assert.equal(result, expected);
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

    it('should remove file paths from error message', function() {
      //given
      let message = "Opening '/Users/oliveroneill04/git/error-parser.js'";
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, null);
    });

    it('should not flag output lines that just have the word error in them', function() {
      // given
      let message = "should not flag input lines even if they contain the word error in them";
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, null);
    });
  });
});
