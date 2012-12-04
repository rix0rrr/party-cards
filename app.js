var express = require('express');

// Roundabout initialization of Socket.IO, required for express 3.0
var app    = express()
    http   = require('http'),
    server = http.createServer(app),
    io     = require('socket.io').listen(server);

app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 

app.get('/', function(req, res) {
    res.send('<html><body><ul><li><a href="/view/view.html">View board</a></li><li><a href="/post/post.html">Send card</a></ul>');
});
app.use(express.static('www'));

//--------------------------------------------------------------------------------------
//  CARD SINK
//--------------------------------------------------------------------------------------
var heap = new (require('./cardheap')).CardHeap({
    persist: 'messages.json'
}).on('card', function(card) {
    io.sockets.emit('card', card);
});

heap.start();

//--------------------------------------------------------------------------------------
//  CARD SOURCES
//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------
//  Twitter
var twitter = new (require('./sources/twitter')).TwitterSearch('felienne via.me', {
    viaMeApiKey: 'akpxttag5zbbyob5syjc3ntxs'
}).on('tweet', function(tweet) {
    heap.add(tweet.id, tweet.fresh, {
        from: tweet.from_user,
        message: tweet.text,
        picture: tweet.picture
    });
}).start();

//--------------------------------------------------------------------------------------
//  New card posted via the web form
var form = new (require('./sources/form-post')).FormPost(app, __dirname + '/www/uploads', '/uploads')
.on('formcard', function(post) {
    heap.add(heap.uniqueId(), true, {
        from: post.from,
        message: post.message,
        picture: post.picture,
        cardtype: post.cardtype
    });
});
io.sockets.on('connection', form.listenToSocket);

//--------------------------------------------------------------------------------------
//  START
//--------------------------------------------------------------------------------------

server.listen(3000);
console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
