//Importing FS
var fs = require('fs');

/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
//declare var body to store all of our messages
var body = {results: []};
//declared our requestHandler function
var requestHandler = function(request, response) {

  //all the default values for our headers.
  var headers = {
    'access-control-allow-origin': '*',
    //allowed methods that the server will accep
    'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'access-control-allow-headers': 'content-type, accept',
    'access-control-max-age': 10, // Seconds.
    //Content type of server response, specifically our messages
    'Content-Type': 'application/json'
  };
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  //object containing the acceptable file paths
  var urlKeys = {
    '/': true,
    '/styles/styles.css': true,
    '/bower_components/jquery/dist/jquery.js': true,
    '/scripts/app.js': true,
    '/favicon.ico': true,
    '/styles/styles.css': true
  };

  //checking to see if request is invalid...
  if (!urlKeys[request.url] && !request.url.startsWith('/classes/messages')) {
    //if invalid, change status code to 404
    response.writeHead(404, headers);
    //respond back with message indicating error
    response.end('404 ERROR!!!!!');
    return;
  }

  //if the request type is a POST.....
  if (request.method === 'POST') {
    //and it starts withs classes/messages
    if (request.url.startsWith('/classes/messages')) {
      //change the status to 201
      response.writeHead(201, headers);
      //listen for when there is a change in data,
      //then timestamp it and push to body.results, where we store messages
      request.on('data', (json) => {
        var message = JSON.parse(json);
        message.createdAt = Date.now();
        body.results.unshift(message);
      });
      //send back stringified body
      response.end(JSON.stringify(body));
    }
    //if GET request and URL starts with classes/messages...
  } else if (request.method === 'GET') {
    if (request.url.startsWith('/classes/messages')) {
      response.writeHead(200, headers);
      //return back all our messages
      response.end(JSON.stringify(body));
    } else {
      // handling GET requests to local files
      var filePath = '../client/client';
      // sets filePath and content type for index.html
      if (request.url === '/') {
        headers['Content-Type'] = 'text/html';
        filePath += '/index.html';
      // sets filePath/content type for javascript files
      } else if (request.url.endsWith('.js')) {
        headers['Content-Type'] = 'text/javascript';
        filePath += request.url;
      // sets filePath/content type for css files
      } else if (request.url.endsWith('.css')) {
        headers['Content-Type'] = 'text/css';
        filePath += request.url;
      }

      // reads file using filePath
      fs.readFile(filePath, 'utf8', function (err, contents) {
        // handles our error
        if (err) {
          console.log(err);
          response.writeHead(500, headers);
          response.end();
        // serve file contents to the client
        } else {
          response.writeHead(200, headers);
          //console.log(contents);
          response.end(contents);
        }
      });
    }

  }

};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.

exports.requestHandler = requestHandler;
