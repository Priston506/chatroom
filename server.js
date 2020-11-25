var http = require('http'); // Built in http module provides http server and client functionality
var fs = require('fs'); 
var path = require('path'); // Built in path module provides file system path related functionality
var mime  = require('mime'); //Add on mime module provides ability to derive a mime type based on a file name
var cache = {}; // cache object is where the contents of cache files are stored

function send404(response){
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found');
	response.end();
}

function sendFile(response, filePath, fileContents){
	response.writeHead(200, {"content-type": mime.lookup(path.basename(filePath))});
	response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
if (cache[absPath]) { // check if file is cached in memory
sendFile(response, absPath, cache[absPath]);  // serve file from memory
} else {
fs.exists(absPath, function(exists) { //check if file exists
if (exists) {
fs.readFile(absPath, function(err, data) {  // read file from disk
if (err) {
send404(response);
} else {
cache[absPath] = data;
sendFile(response, absPath, data);  // serve file from disk
}
});
} else {
send404(response); // serve http 404 server response
}
});
}
}

var server = http.createServer(function(request, response) {  // Create HTTP server using anynomous function to define pre request behaviour
var filePath = false;
if (request.url == '/') {
filePath = 'public/index.html'; // Determine HTML file to be served by default
} else {
filePath = 'public' + request.url;  // translate URL path to relative file path
}
var absPath = './' + filePath;
serveStatic(response, cache, absPath); // serve static file
});

server.listen(3000, function() {
console.log("Server listening on port 3000.");
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);

