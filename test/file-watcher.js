const assert = require('assert');
const sinon = require("sinon");
const rewire = require("rewire");

var FileWatcher = rewire("../lib/file-watcher.js");

describe('FileWatcher', function() {
  var file = "logname.log";
  var chokidarMock, chokidarWatcherMock, tailClassMock, tailMock;

  beforeEach(function() {
    // initialise mocks
    chokidarWatcherMock = {
      on: sinon.stub(),
      close: sinon.stub()
    }
    chokidarMock = {
        watch: sinon.stub().returns(chokidarWatcherMock)
    };
    // tail mocks
    tailClassMock = sinon.stub();
    tailMock = tailClassMock.prototype;
    tailMock.on = sinon.stub();
    tailMock.unwatch = sinon.stub();
    // rewire
    FileWatcher.__set__("chokidar", chokidarMock);
    FileWatcher.__set__("Tail", tailClassMock);
  });

  describe('constructor', function() {
    it('should watch the correct parent directory of input file', function() {
      // given
      let dir = "home/user1/Documents/test/logdir";
      file = dir + "/logname.log";
      // when
      let fileWatcher = new FileWatcher(file);
      // then
      sinon.assert.calledWith(chokidarMock.watch, dir);
    });

    it('should watch the current directory if the input file is only a filename', function() {
      file = "logname.log";
      // when
      let fileWatcher = new FileWatcher(file);
      // then
      let expected = ".";
      sinon.assert.calledWith(chokidarMock.watch, expected);
    });

    it('should watch directory changes until the file is created', function() {
      // when
      let fileWatcher = new FileWatcher(file);
      // then
      // ensure that we wait for added file
      sinon.assert.calledWith(chokidarWatcherMock.on, "add", sinon.match.any);
      // ensure that tail is not used until file is created
      sinon.assert.notCalled(tailMock.on);
    });

    it('should watch directory changes and ignore other file changes', function() {
      // when
      let fileWatcher = new FileWatcher(file);
      // ensure that we're watching for added files
      sinon.assert.calledWith(chokidarWatcherMock.on, "add", sinon.match.any);
      // create add event for new file, the second argument is the callback
      // that should be called on new file creation
      let cb = chokidarWatcherMock.on.getCall(0).args[1];
      cb("other_file.log");
      // then
      // check that close is called on directory watcher
      sinon.assert.notCalled(chokidarWatcherMock.close);
      // ensure that tail is used now for line changes
      sinon.assert.notCalled(tailMock.on);
    });

    it('should watch file when created', function() {
      // when
      let fileWatcher = new FileWatcher(file);
      // ensure that we're watching for added files
      sinon.assert.calledWith(chokidarWatcherMock.on, "add", sinon.match.any);
      // create add event for new file, the second argument is the callback
      // that should be called on new file creation
      let cb = chokidarWatcherMock.on.getCall(0).args[1];
      cb(file);
      // then
      // check that close is called on directory watcher
      sinon.assert.called(chokidarWatcherMock.close);
      // ensure that tail is used now for line changes
      sinon.assert.calledWith(tailMock.on, "line", sinon.match.any);
      sinon.assert.calledWith(tailMock.on, "error", sinon.match.any);
    });

    it('should not wait for file creation when specified', function() {
      // when
      let fileWatcher = new FileWatcher(file, true);
      // ensure that we're watching for added files
      sinon.assert.notCalled(chokidarWatcherMock.on);
      // then
      // ensure that tail is used now for line changes
      sinon.assert.calledWith(tailMock.on, "line", sinon.match.any);
    });

    it('should watch file changes and emit events to send new lines', function() {
      // given
      var expected = "This is a test line"
      let newLineCallback = sinon.stub();
      // when
      let fileWatcher = new FileWatcher(file);
      fileWatcher.on('line', newLineCallback);
      // ensure that we're watching for added files
      sinon.assert.calledWith(chokidarWatcherMock.on, "add", sinon.match.any);
      // create add event for new file, the second argument is the callback
      // that should be called on new file creation
      let cb = chokidarWatcherMock.on.getCall(0).args[1];
      cb(file);
      // check that close is called on directory watcher
      sinon.assert.called(chokidarWatcherMock.close);
      // ensure that tail is used now for line changes
      sinon.assert.calledWith(tailMock.on, "line", sinon.match.any);
      // the second argument will trigger new line event
      let lineCallback = tailMock.on.getCall(0).args[1];
      lineCallback(expected);
      // then
      sinon.assert.calledWith(newLineCallback, expected);

      // Check that it works multiple times
      expected = "Another line to test";
      lineCallback(expected);
      sinon.assert.calledWith(newLineCallback, expected);
    });

    it('should emit error events from chokidar', function() {
      // given
      let expected = "Error message: Something went wrong";
      let errorCallback = sinon.stub();
      // when
      let fileWatcher = new FileWatcher(file);
      fileWatcher.on('error', errorCallback);
      // ensure that we're watching for added files
      sinon.assert.calledWith(chokidarWatcherMock.on, "error", sinon.match.any);
      let cb = chokidarWatcherMock.on.getCall(1).args[1];
      cb(expected);
      // then
      sinon.assert.calledWith(errorCallback, expected);
    });

    it('should emit error events from tail', function() {
      // given
      let expected = "Error message: Something went wrong";
      let errorCallback = sinon.stub();
      // when
      let fileWatcher = new FileWatcher(file, true);
      fileWatcher.on('error', errorCallback);
      // ensure that we're watching for added files
      sinon.assert.calledWith(tailMock.on, "error", sinon.match.any);
      let cb = tailMock.on.getCall(1).args[1];
      cb(expected);
      // then
      sinon.assert.calledWith(errorCallback, expected);
    });
  });

  describe('cleanup', function() {
    it('should cleanup watchers', function() {
      // when
      let fileWatcher = new FileWatcher(file);
      sinon.assert.calledWith(chokidarWatcherMock.on, "add", sinon.match.any);
      // create add event for new file, the second argument is the callback
      // that should be called on new file creation
      let cb = chokidarWatcherMock.on.getCall(0).args[1];
      cb(file);
      fileWatcher.cleanup();
      // then
      sinon.assert.called(tailMock.unwatch);
      sinon.assert.called(chokidarWatcherMock.close);
    });

    it('should cleanup directory watcher even if file isnt created yet', function() {
      // when
      let fileWatcher = new FileWatcher(file);
      sinon.assert.calledWith(chokidarWatcherMock.on, "add", sinon.match.any);
      fileWatcher.cleanup();
      // then
      sinon.assert.called(chokidarWatcherMock.close);
    });
  })
});
