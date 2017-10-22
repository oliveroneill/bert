const assert = require('assert');

var ErrorParser = require("../lib/error-parser.js");

describe('ErrorParser', function() {
  describe('parse', function() {
    it('should flag errors correctly', function() {
      // given
      let message = "ERROR: test error";
      let parser = new ErrorParser();
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, message);
    });

    it('should flag exited status code correctly', function() {
      // given
      let message = "exited with status code 1";
      let parser = new ErrorParser();
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, message);
    });

    it('should flag a real stacktrace correctly', function() {
      // given
      let message =
        `2015-05-29T09:35:09.793Z - error: [api] TypeError: Cannot call method 'logger' of undefined stack=TypeError: Cannot call method 'logger' of undefined
        at /path/path-api/src/plugins/file.coffee:286:32
        at /path/path-api/node_modules/mongodb/lib/mongodb/collection/query.js:159:5
        at Cursor.nextObject (/path/path-api/node_modules/mongodb/lib/mongodb/cursor.js:742:5)`;
      let parser = new ErrorParser();
      // when
      let result = parser.parse(message);
      // then
      assert.equal(result, message);
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
