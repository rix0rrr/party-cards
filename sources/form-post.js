/**
 * A post that comes in via the web form is also a card source
 */

var upload = require('jquery-file-upload-middleware'),
    fs = require('fs'),
    express = require('express');

module.exports = {
    FormPost: function(app, dir, uploadUrl) {
        var self = this;
        var tmpDir = dir + '/tmp';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

        app.use('/upload', upload.fileHandler({
            uploadDir: dir,
            uploadUrl: uploadUrl,
            tmpDir: tmpDir
        }));

        // Call this on every new Socket.IO socket to listen for cards on it
        self.listenToSocket = function(socket) {
            socket.on('formcard', function(post) {
                post.when    = Date.now();
                self.emit('formcard', post);
            });
        }
    }
}

module.exports.FormPost.prototype = new (require('events')).EventEmitter;
