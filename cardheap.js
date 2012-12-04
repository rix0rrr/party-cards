var _  = require('underscore');
var fs = require('fs');

module.exports = {
    /**
     * Manager for the set of cards
     *
     * Periodically picks a card to be displayed; fresh cards will be picked in
     * order; if there are no more fresh cards, a random card will be picked
     * from the pile of previously displayed cards. All cards from the pile
     * will be picked at least once before a card is picked again.
     */
    CardHeap : function(options) {
        var self = this;

        options = options || {};
        options.pickInterval = options.pickInterval || 10000;
        options.persist      = options.persist      || undefined;

        var everything = {};

        var freshIds   = [];
        var heapIds    = [];

        var asap   = false;
        var saving = false;

        /**
         * Add a new card to the pile
         *
         * If it is fresh, it will be added to the queue of fresh material;
         * otherwise it will be put on the pile of "old stuff" and possibly be
         * picked later on.
         */
        self.add = function(id, fresh, card) {
            if (everything[id]) return;

            everything[id] = card;
            (fresh ? freshIds : heapIds).push(id);

            if (asap && timer) pick(); // ASAP, but only if the timer is currently running

            if (options.persist && !saving) {
                // Automatically save if not currently saving
                // NOTE: This doesn't necessarily save everything if the timing so works out,
                // but the likelihood of occurrence is small enough that we don't really care.
                // Also wait to save until the current event has been handled so if we get a 
                // 'bulk add' we trigger the save at the end.
                saving = true;
                setTimeout(function() {
                    self.save(options.persist, function() {
                        saving = false;
                    });
                }, 0);
            }
        }

        self.uniqueId = function() {
            if (!everything.__id) everything.__id = 0;
            return 'id' + everything.__id++;
        }

        var pick = function() {
            if (freshIds.length) {
                // As long as the queue of 'fresh' items is non-empty, take from that (in order)
                var id = freshIds.shift();
                self.emit('card', everything[id]);
            }
            else {
                // If we exhausted the list of heapids, get them all back from the list of pickedIds
                if (heapIds.length == 0) heapIds = _.keys(everything);
                
                if (heapIds.length) {
                    // Yes, at least one card to pick
                    var id = heapIds.splice(_.random(heapIds.length - 1), 1)[0];

                    self.emit('card', everything[id]);
                }
                else {
                    // Nothing to do right now -- instead fire pick() as soon as a card is added later on
                    asap = true;
                }
            }

            // Clear timer and restart from now. Necessary because a timer may
            // already be running if this invocation is because of 'asap'.
            self.stop();
            self.start();
        };

        var timer;
        self.start = function() { timer = setTimeout(pick, options.pickInterval); }
        self.stop  = function() { clearTimeout(timer); timer = undefined; }

        // If we do automatic persisting, replace the start() function with a
        // start function that does an initial load from disk, then restores
        // and invokes the original start.
        if (options.persist) {
            var _start = self.start;
            self.start = function() {
                self.load(options.persist, function() {
                    self.start = _start;
                    self.start();
                });
            }
        }

        /**
         * Load all messages from the given fileName (they will be considered not fresh)
         */
        self.load = function(fileName, callback) {
            fs.readFile(fileName, function(err, contents) {
                if (contents) _(everything).extend(JSON.parse(contents));
                callback();
            });
        }

        /**
         * Save all messages seen so far to the given file
         */
        self.save = function(fileName, callback) {
            fs.writeFile(fileName, JSON.stringify(everything), function (err) {
                if (err) throw err;
                callback();
            });
        }
    }
}

module.exports.CardHeap.prototype = new (require('events')).EventEmitter;
