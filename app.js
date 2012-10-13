
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer();

var io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/',      routes.index);
app.get('/post',  routes.post);
app.get('/view',  routes.view);

var all_posts = [];

// Socket I/O 
io.sockets.on('connection', function(socket) {
  // Send all old messages
  all_posts.forEach(function(message) {
    socket.emit('oldpost', message);
  });
  
  /**
   * Whenever a post comes in, add it to the log and broadcast to all connected clients
   */
  socket.on('newpost', function(post) {
    post.when = Date.now();
    all_posts.push(post);
    io.sockets.emit('newpost', post);
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
