(function($) {
    $.rand = function(arg) {
        if ($.isArray(arg)) {
            return arg[$.rand(arg.length)];
        } else if (typeof arg === "number") {
            return Math.floor(Math.random() * arg);
        } else {
            return 4;  // chosen by fair dice roll
        }
    };
})(jQuery);

var cards = {
}

Math.nrand = function() {
	var x1, x2, rad;
 
	do {
		x1 = 2 * this.random() - 1;
		x2 = 2 * this.random() - 1;
		rad = x1 * x1 + x2 * x2;
	} while(rad >= 1 || rad == 0);
 
	var c = this.sqrt(-2 * Math.log(rad) / rad);
 
	return x1 * c;
};

function Postcard(options) {
    options = options || {};
    this.from       = options.from       || 'Aunt Tillie';
    this.message    = options.message    || 'Hi there! -xxx-';
    this.cardtype   = options.cardtype   || '';
    this.picture    = options.picture    || '';
}

var fonts = [
    'Crafty Girls', 
    'Coming Soon'
    ];

function traceSize(element, viewport) {
    var update = function() {
        element.width(viewport.width());
        element.height(viewport.height());
    };

    viewport.resize(update);
    update();
}

var visibleTimeSec = 10;
var disappearTimeSec = 15; // Must be at least the time specified in the 'disappear' class

function Surface(element) {
    var self = this;

    self.drop = function(postcard) {
        var w    = 400;
        var hEst = 500; // Estimated height

        var x = $.rand(element.width() - w);
        var y = $.rand(element.height() - hEst);

        var doFadeIn;
        var triggerFadeIn = function() {
            setTimeout(function() {
                doFadeIn();
            }, 0);
        };

        var img;
        if (postcard.picture) {
            img = $('<img class="picture">');
            if ($.isFunction(postcard.picture)) {
                postcard.picture(function(url) {
                    img.attr('src', postcard.picture).load(triggerFadeIn);
                });
            }
            else 
                img.attr('src', postcard.picture).load(triggerFadeIn);
        }
        else triggerFadeIn();

        var card = $('<div class="postcard">').addClass(postcard.cardtype)
            .append(img)
            .append($('<div class="message">').html(postcard.message))
            .append($('<div class="sender">').text(postcard.from))
            .css({
                position: 'absolute',
                left: x,
                top: y,
                width: 400,
                fontFamily: "'" + $.rand(fonts) + "', cursive"
            });

        card.appendTo(element);

        doFadeIn = function() {
            setTimeout(function() {
                // Animation will only be triggered if objects has been good and added to the DOM already 
                // before the transition properties are set.
                var rot = Math.nrand() * 15;
                card.css({
                    opacity: 1,
                    '-webkit-transform': 'rotate(' + rot + 'deg)',
                    '-webkit-animation': 'shrink1' + $.rand(2) + ' 100ms',
                    '-webkit-transition' : '-webkit-transform 2s ease-out, opacity 1s ease-out'
                });

                setTimeout(function() {
                    card.addClass('disappear');
                    setTimeout(function() {
                        card.remove();
                    }, disappearTimeSec * 1000);
                }, visibleTimeSec * 1000);
            }, 0);
        };
    }
}
