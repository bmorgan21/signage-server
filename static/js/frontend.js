$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var status = $('#status');
    var status_icon = status.find('i');
    var status_text = status.find('.text');
    var status_right = $('#status-right');
    var terminal_id = getQueryStringValue('id').toLowerCase();
    var modal = $('#myModal');


    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        $('span').hide();
        return;
    }

    // open connection
    var connection = new ReconnectingWebSocket('ws://' + location.hostname + ':1337');

    connection.onopen = function () {
        status_text.text('Connected');
        status_icon.attr('class', 'glyphicon glyphicon-flash');
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        status_text.text('Disconnected');
        status_icon.attr('class', 'glyphicon glyphicon-remove');
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        // NOTE: if you're not sure about the JSON structure
        // check the server source code above
        if (json.type === 'history') { // entire message history
            // insert every single message to the chat window
            for (var i=0; i < json.data.length; i++) {
                addMessage(json.data[i]);
            }
        } else if (json.type === 'message') { // it's a single message
            addMessage(json.data);
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
    };

    function getQueryStringValue (key) {
        return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    }

    /**
     * Add message to the chat window
     */
    function addMessage(data) {
        var target = data.target;

        if (target && terminal_id.search(target) == 0) {
            var title = data.title;
            var message = data.text;
            var dt = new Date(data.time);
            var location = data.location;
            var delay = parseInt(data.delay);
            if (isNaN(delay)) {
                delay = 5;
            }

            if (location == 'modal') {
                if (title) {
                    modal.find('.modal-header').html(title).show();
                } else {
                    modal.find('.modal-header').hide();
                }
                modal.find('.modal-body').html(message);
                modal.modal('show');
                setTimeout(function() {
                    modal.modal('hide');
                }, delay * 1000);
            } else if (location == 'status_right') {
                status_right.html(message);
            } else {
                content.html(message);
                status_text.html('Updated ' + moment(dt).format('MMMM Do YYYY, h:mm:ss a'));
            }
        }
    }
});
