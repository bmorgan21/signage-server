// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'signage-server';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

/**
 * Global variables
 */
var history = [];
var maxHistory = 1;
// list of currently connected clients (users)
var clients = [ ];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );

var objectKey = function(obj) {
    return obj.target + '-' + obj.location;
};

var handleMessage = function(message) {
    if (message.type === 'utf8') { // accept only text
        var target = message.target;
        var location = message.location;

        if (target) {
            // we want to keep history of all sent messages
            var obj = {
                target: target,
                time: (new Date()).getTime(),
                title: message.title,
                text: message.utf8Data,
                location: location,
                delay: message.delay
            };

            var keys = {};

            if (location != 'modal' && location != 'system') {
                history.push(obj);
                var key = objectKey(obj);

                var numSeen = 0;
                for (var i=history.length-1; i >= 0; i--) {
                    var o = history[i];
                    var k = objectKey(o);

                    if (k == key) {
                        if (numSeen == maxHistory) {
                            history.splice(i, 1);
                            break;
                        }
                        numSeen++;
                    }
                }
            }

            // broadcast message to all connected clients
            var json = JSON.stringify({ type:'message', data: obj });
            for (var i=0; i < clients.length; i++) {
                clients[i].sendUTF(json);
            }
            return true;
        } else {
            console.log('WARNING: missing target in message');
        }
    }
    return false;
};


/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    var userName = false;
    var userColor = false;

    console.log((new Date()) + ' Connection accepted.');

    // send back chat history
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
    }

    // user sent some message
    connection.on('message', handleMessage);

    // user disconnected
    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });

});

var dispatcher = require('httpdispatcher');

//Lets define a port we want to listen to
var PORT=8080;

//We need a function which handles requests and send response
function handleRequest(request, response){
    try {
        //log the request on console
        console.log(request.url);
        //Disptach
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log((new Date()) + " Server is listening on port " + PORT);
});

//For all your static (js/css/images/etc.) set the directory name (relative path).
dispatcher.setStatic('static');
dispatcher.setStaticDirname('.');

var errorListener = function(req, res) {
	res.writeHead(404);
	res.end('Not Found!');
};

dispatcher.onGet("/", function(req, res) {
    var url = require('url').parse(req.url, true);
	var filename = "index.html";

    require('fs').readFile(filename, function(err, file) {
		if(err) {
			errorListener(req, res);
			return;
		}
		res.writeHeader(200, {
			"Content-Type": require('mime').lookup(filename)
		});
		res.write(file, 'binary');
		res.end();
	});
});

//A sample POST request
dispatcher.onPost("/message", function(req, res) {
    var message = null;
    try {
        message = JSON.parse(req.body);
        handleMessage(message);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Got Post Data');
    } catch(err) {
        console.log(err);
        res.writeHead(504, {'Content-Type': 'text/plain'});
        res.end('Error: ' + err);
    }

});
