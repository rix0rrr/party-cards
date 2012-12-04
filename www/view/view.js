/**
 * Main view script
 *
 * Rendering is handled by the postcards module
 *
 * This module basically spawns a new postcard every time a message comes in over the Socket.IO link
 */
$(function() {
    // Surface always fills the entire screen
    var s = new Surface($('.surface'));
    traceSize($('.surface'), $(window));

    var socket = io.connect('/');
    socket.on('card', function (card) {
        s.drop(new Postcard(card));
    });
});
