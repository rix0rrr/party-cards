if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
    return this.slice(this.length - str.length) == str;
  };
}

var request = require('request');
var _ = require('underscore');

/**
 * Read twitter for a certain hashtag
 * 
 * Does this by periodically requesting the search API.
 *
 * On every tweet, a 'tweet' event is raised containing the tweet data.
 * - .picture is the URL of a picture in the tweet, if any.
 * - .fresh is a boolean indicating whether this is a live tweet or one from
 *   a saved search.
 */
module.exports = {
    TwitterSearch: function(query, options) {
        options = options || {};
        options.refreshInterval = options.refreshInterval || 5000;

        var self = this;

        // This is the initial query
        var nextQuery = '?q=' + encodeURIComponent(query) + '&include_entities=true&result_type=recent';
        var fresh = true;
        var timer;

        var fetch = function() {
            request.get({ url: 'http://search.twitter.com/search.json' + nextQuery, json: true }, function(err, response, data) {
                if (data && data.results) {
                    nextQuery = data.refresh_url;

                    data.results.forEach(function(tweet) {
                        tweet.fresh = fresh;
                        findTweetPicture(tweet, function(tweet) {
                            self.emit('tweet', tweet);
                        });
                    });

                    fresh = false;
                }
                else console.log("Error retrieving twitter", err, response, data);

                timer = setTimeout(fetch, options.refreshInterval);
            });
        };

        this.start = function() {
            fetch();
        }
        this.stop = function() {
            clearInterval(timer);
        }

        /**
         * Find a picture in this tweet
         *
         * Extract the media_url of any picture to the .picture property, then strip
         * the url from the tweet to de-uglify it.
         */
        function findTweetPicture(tweet, finished) {
            // Call this with the entity that contains the picture, and the URL that the picture
            // resolves to.
            var setPicture = function(picture_url, entity) {
                tweet.picture = picture_url;
                tweet.text    = tweet.text.replace(entity.url, '');
                tweet.text    = tweet.text.replace(entity.display_url, '');
                finished(tweet);
            }

            if (tweet.entities && tweet.entities.media && tweet.entities.media.length) {
                var pic = tweet.entities.media[0];
                setPicture(pic.media_url, pic);
                return;
            }

            // Add a special case for some image hosters which we recognize but don't show up
            // as media entities.Instagram pictures, which we can recognize but don't
            // show up as a media entity.
            var found = false;
            if (tweet.entities.urls) found = _.any(tweet.entities.urls, function(url) {
                var parts = url.expanded_url.split('/');

                if (url.expanded_url.startsWith('http://instagr.am/p/') || url.expanded_url.startsWith('http://instagram.com/p/')) {
                    setPicture(url.expanded_url + 'media?size=l', url);
                    return true;
                }
                if (url.expanded_url.startsWith('http://twitpic.com/')) {
                    setPicture('http://twitpic.com/show/full/' + parts[parts.length - 1], url);
                    return true;
                }
                if (url.expanded_url.startsWith('http://yfrog.com/') && (url.expanded_url.endsWith('j') || url.expanded_url.endsWith('p'))) {
                    setPicture(url.expanded_url + ':medium', url);
                    return true;
                }
                if (url.expanded_url.endsWith('.jpg') || url.expanded_url.endsWith('.gif') || url.expanded_url.endsWith('.png')) {
                    // Maybe it's just a direct (shortened) link to an image
                    setPicture(url.expanded_url, url);
                    return true;
                }
                if (url.expanded_url.startsWith('http://cinemagr.am/show/')) {
                    setPicture('http://cinemagr.am/uploads/' + parts[parts.length - 1] + '.gif', url);
                    return true;
                }
                if (url.expanded_url.startsWith('http://via.me/')) {
                    if (options.viaMeApiKey) {
                        var id = parts[parts.length - 1];
                        if (id.startsWith('-')) id = id.substr(1);

                        request.get({ url: 'https://api.via.me/v1/posts/' + id + '?client_id=' + options.viaMeApiKey + '&callback=?', json: true }, function(error, res, data) {
                            if (data.response && data.response.post)
                                setPicture(data.response.post.media_url, url);
                            else {
                                console.log("Via.me image detected but no media URL found in post info");
                                finished(tweet);
                            }
                        });
                    }
                    else console.log("Via.me image detected but no viaMeApiKey available");
                    return true;
                }
            });

            if (!found) finished(tweet); // Pass it on without picture, otherwise it was already passed on or a callback is in progress
        }
    }
}

var events = require('events');
module.exports.TwitterSearch.prototype = new events.EventEmitter;
