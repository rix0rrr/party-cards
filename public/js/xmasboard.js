$(function() {
  var socket = io.connect('/');

  $('#from').popover({
    trigger: 'manual',
    title: 'Oeps',
    content: 'Vergeet niet te vertellen van wie dit berichtje afkomt!'
  });
  $('#message').popover({
    trigger: 'manual',
    title: 'Oeps',
    content: 'Vul een berichtje in'
  });

  /**
   * When the POST button is clicked, post the current message over the socket
   */
  $('#postMessage').click(function() {
    var from    = $('#from').val();
    var message = $('#message').val();

    if (!message) {
      $('#message').popover('show');
      return;
    }
    if (!from) {
      $('#from').popover('show');
      return;
    }

    socket.emit('newpost', { from: from, message: message });

    $('#post-form').hide("drop", { direction: "up" }, 500, function() {
      $('#from').val('');
      $('#message').val('').focus();
      $('#post-form').show("drop", { direction: "down" }, 500);
    });
  });

  // Hide error popover on focus
  $('#message, #from').focus(function() { $(this).popover('hide'); });
  // Focus input field
  $('#message').focus();

  // Add some CSS styles that are not possible otherwise
  $('#post-page').parent('body').attr('id', 'post-body');
  $('#view-page').parent('body').attr('id', 'view-body');

  function createPostVisualization(post) {
      return $('<div>').addClass('post')
        .append($('<div>').addClass('message').text(post.message))
        .append($('<div>').addClass('from').text(post.from))
  }

  var all_posts = [];

  function setDistance(element, scale) {
      var clause = 'scale(' + scale + ', ' + scale + ')';

      var greyLevel = Math.floor(255 * scale).toString(16);
      return element.css({
          'transform': clause,
          '-ms-transform': clause,
          '-webkit-transform': clause,
          '-o-transform': clause,
          '-moz-transform': clause,
          backgroundColor: '#' + greyLevel + greyLevel + greyLevel
      });
  }

  var shrinkByHalfS = 15 * 60; // Approx.
  var scrollByTime  = 10000;
  var repickIntervalS = 3;
  var repickTimer;

  function scrollBy(element, speed) {
      var x = Math.random() * ($(document).outerWidth() - element.outerWidth());
      element.css({
          position: 'absolute',
          'left': x,
          'top': $(document).outerHeight() + 10, 
          zIndex: speed * 1000 // Kind of a hack, but higher speed equals more to the front
      });
      element.animate({
          'top': -element.outerHeight()
      }, scrollByTime * speed, 'linear', function() {
          element.remove();
      });
  }

  function animatePost(post) {
      var el     = createPostVisualization(post);
      var deltaT = (Date.now() - post.when) / 1000;
      var scale  = 1 / Math.log(deltaT / (shrinkByHalfS / 4) + Math.E);
      // The 0.5 point of this log function is around 4, not exactly
      // but close enough.

      el.appendTo($('#view-page'));

      setDistance(el, scale);
      scrollBy(el, 1 / scale);

      scheduleOldPostPicker();
  }

  function scheduleOldPostPicker() {
      clearTimeout(repickTimer);
      var repickTimer = setTimeout(repickOldPost, repickIntervalS * 1000);
  }

  function repickOldPost() {
    if (all_posts.length == 0) return;

    var ix = Math.floor(Math.random() * all_posts.length);
    animatePost(all_posts[ix]);
  }

  /**
   * When a message is received, add it to the VIEW screen
   */
  socket.on('oldpost', function(post) {
      all_posts.push(post);
  });
  scheduleOldPostPicker();

  socket.on('newpost', function(post) {
      all_posts.push(post);
      animatePost(post);
  });
});
