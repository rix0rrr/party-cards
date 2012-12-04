$(function() {
    var socket = io.connect('/');

    function CardForm() {
        var self = this;

        self.message = ko.observable('');
        self.from    = ko.observable('');
        self.picture = ko.observable('');
        self.uploading = ko.observable(false);

        self.doPost = function() {
            if (self.message() == '' || self.from() == '') return;

            socket.emit('formcard', {
                from: self.from(),
                message: self.message(),
                picture: self.picture()
            });

            $('#post-form').hide("drop", { direction: "up" }, 500, function() {
                self.message('');
                self.from('');
                self.picture('');
                $('#post-form').show("drop", { direction: "down" }, 500);
            });
        };

        self.canPost = ko.computed(function() {
            return !self.uploading();
        });

        self.postCaption = ko.computed(function() {
            return self.uploading() ? 'Uploaden...' : 'Sturen';
        });
    }

    var card = new CardForm();
    ko.applyBindings(card);

    // Make the file upload button active (submit immediately, put URL in viewmodel when done)
    $(function () {
        $('#fileupload').fileupload({
            dataType: 'json',
            add: function (e, upload) {
                upload.submit();
                card.uploading(true);
            },
            done: function (e, upload) {
                card.uploading(false);
                card.picture(upload.result[0].url);
            }
        });
    });
});
