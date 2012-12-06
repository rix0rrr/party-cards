// Normally distributed random variable centerd around 0 with unit deviation
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

// FIXME: Actual thumbnails
var cardStyles = [];
var num_cards = 15;

var cardStyles = [
    { klass: 'card0',  image: '',                      color: 'black',      shadow: 'white',  photo: 'right', size: 'narrow' },
    { klass: 'card1',  image: '/postcards/card1.jpg' , color: 'white',      shadow: 'black',  photo: 'right', size: 'narrow' },
    { klass: 'card2',  image: '/postcards/card2.jpg' , color: 'white',      shadow: 'black',  photo: 'left' , size: 'narrow' },
    { klass: 'card3',  image: '/postcards/card3.jpg' , color: 'white',      shadow: 'black',  photo: 'right', size: 'wide'   },
    { klass: 'card4',  image: '/postcards/card4.jpg' , color: 'yellow',     shadow: 'black',  photo: 'left' , size: 'narrow' },
    { klass: 'card5',  image: '/postcards/card5.jpg' , color: 'black',      shadow: 'white',  photo: 'right', size: 'wide' },
    { klass: 'card6',  image: '/postcards/card6.jpg' , color: 'orange',     shadow: 'black',  photo: 'left' , size: 'narrow' },
    { klass: 'card7',  image: '/postcards/card7.jpg' , color: 'white',      shadow: 'black',  photo: 'right', size: 'narrow' },
    { klass: 'card8',  image: '/postcards/card8.jpg' , color: '#0FFFF3',    shadow: 'black',  photo: 'left' , size: 'narrow' },
    { klass: 'card9',  image: '/postcards/card9.jpg' , color: 'yellow',     shadow: 'black',  photo: 'left' , size: 'wide' },
    { klass: 'card10', image: '/postcards/card10.jpg', color: 'light-blue', shadow: 'black',  photo: 'left' , size: 'narrow' },
    { klass: 'card11', image: '/postcards/card11.jpg', color: 'black',      shadow: 'white',  photo: 'right', size: 'wide' },
    { klass: 'card12', image: '/postcards/card12.jpg', color: 'black',      shadow: 'white',  photo: 'right', size: 'wide' },
    { klass: 'card13', image: '/postcards/card13.jpg', color: 'white',      shadow: 'black',  photo: 'left' , size: 'narrow' },
    { klass: 'card14', image: '/postcards/card14.jpg', color: 'yellow',     shadow: 'black',  photo: 'right', size: 'wide' },
    { klass: 'card15', image: '/postcards/card15.jpg', color: 'orange',     shadow: 'black',  photo: 'left' , size: 'wide' },
    { klass: 'card16', image: '/postcards/card16.jpg', color: 'black',      shadow: 'white',  photo: 'right', size: 'wide' }
];

var cssBlock = function(klass, props) {
    return klass + ' {\n' + $.map(props, function(value, key) {
        if (value) return '  ' + key + ': ' + value + ';';
    }).join("\n") + '\n}\n';
};

Postcards = {
    randomStyle: function() {
        return cardStyles[Math.floor(Math.random() * cardStyles.length)].klass;
    },

    getCardStyles: function(callback) {
        callback(cardStyles);
    },

    /**
     * Generate CSS based on the card style hints
     */
    generateCSS: function() {
        $("<style>").html($.map(cardStyles, function (style) {
            var picture = {
                left:   5,
                top:    10,
                width:  35,
                height: 80
            };

            var message = {
                left:   45,
                top:    10,
                width:  50,
                height: 60
            };

            var from = {
                left:   45,
                top:    80,
                width:  50,
                height: 10
            };

            if (style.size == 'wide') {
                var grow = 15;
                picture.width += grow;
                message.left  += grow;
                from.left     += grow;
                message.width -= grow;
                from.width    -= grow;
            }

            if (style.photo == 'right') {
                var right = message.left + message.width;
                message.left = picture.left;
                from.left    = picture.left;
                picture.left = right - picture.width;
            }

            $.each(picture, function(key, value) { picture[key] = value + '%'; });
            $.each(message, function(key, value) { message[key] = value + '%'; });
            $.each(from, function(key, value)    { from[key] = value + '%'; });

            var k = '.' + style.klass;
            return cssBlock(k, {
                'background-image': 'url(' + style.image + ')',
                'color': style.color,
                'text-shadow': '1px 1px 2px ' + style.shadow
            }) +
            cssBlock(k + ' .picture', picture) +
            cssBlock(k + ' .message', message) +
            cssBlock(k + ' .from', from);
        }).join("\n")).appendTo("head");
    }
};

/**
 * Surface class, for dropping postcards
 */
function Surface(element) {
    var self = this;

    self.drop = function(postcard) {
        var ratio = 9/16;

        var alpha = Math.max(0.4, Math.min((Math.nrand() * 0.05 + 0.45), 0.5));
        var w     = element.width() * alpha;
        var hEst  = w * ratio; // Estimated height
        var fontSize = w * (28/700);

        var x = Math.floor(Math.random() * (element.width() - w));
        var y = Math.floor(Math.random() * (element.height() - hEst));

        var doFadeIn;
        var triggerFadeIn = function() {
            setTimeout(function() {
                doFadeIn();
            }, 0);
        };

        var img;
        if (postcard.picture) {
            img = $('<img>');
            if ($.isFunction(postcard.picture)) {
                postcard.picture(function(url) {
                    img.attr('src', postcard.picture).load(triggerFadeIn);
                });
            }
            else 
                img.attr('src', postcard.picture).load(triggerFadeIn);
        }
        else triggerFadeIn();

        var message = $('<div class="message">').html(postcard.message);
        var from = $('<div class="from">').text(postcard.from);
        var card = $('<div class="postcard">').addClass(postcard.cardtype ? postcard.cardtype : 'card0')
            .append($('<div class="picture">').append(img))
            .append(message)
            .append(from)
            .css({
                position: 'absolute',
                left: x,
                top: y,
                width: w,
                height: hEst,
                fontFamily: "'" + Math.floor(Math.random() * fonts.length) + "', cursive",
                fontSize: fontSize + 'px'
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
                    '-webkit-animation': 'shrink 100ms',
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

if (typeof exports != 'undefined') {
    exports.Postcards = Postcards;
}
