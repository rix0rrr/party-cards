$(function() {
    var socket = io.connect('/');

    function CardForm() {
        var self = this;

        self.cardStyles = ko.observable([]);
        self.cardStyle  = ko.observable('');

        self.message   = ko.observable('');
        self.from      = ko.observable('');
        self.picture   = ko.observable('');
        self.cardtype  = ko.observable('');
        self.uploading = ko.observable(false);
        self.progress  = ko.observable(0);

        self.uploadAvailable = ko.observable(true);

        self.doPost = function() {
            if (self.message() == '' || self.from() == '') return;

            socket.emit('formcard', {
                from: self.from(),
                message: self.message(),
                picture: self.picture(),
                cardtype: self.cardStyle().klass
            });

            $('#post-form').hide("drop", { direction: "up" }, 500, function() {
                self.message('');
                self.from('');
                self.picture('');
                $('#post-form').show("drop", { direction: "down" }, 500);
            });
        };

        self.canPost = ko.computed(function() {
            return !self.uploading() && self.message() && self.from();
        });

        self.postCaption = ko.computed(function() {
            return self.uploading() ? 'Uploaden...' : 'Sturen';
        });

        self.selectCardStyle = self.cardStyle;
    }

    var model = new CardForm();
    ko.applyBindings(model);
    Postcards.getCardStyles(function(data) {
        model.cardStyles(data);
        model.cardStyle(_.find(data, function(x) { return x.image; }));
    });
    Postcards.generateCSS();

    model.uploadAvailable(!$('#fileupload').attr('disabled'));

    // Make the file upload button active (submit immediately, put URL in viewmodel when done)
    $(function () {
        $('#fileupload').fileupload({
            dataType: 'json',
            add: function (e, upload) {
                upload.submit();
                model.uploading(true);
            },
            done: function (e, upload) {
                model.uploading(false);
                model.picture(upload.result[0].mobile_url || upload.result[0].url);
            },
            progressInterval: 500,
            progress: function (e, data) {
                try {
                    var frac = data.loaded / data.total;
                    model.progress(Math.round(frac * 100));
                } catch (e) {
                    // Well that's too bad
                }
            }
        });
    });
});
