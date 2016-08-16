var fs = require('fs');

/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var body = {results: []};
var requestHandler = function(request, response) {
  console.log(decodeURI(request.url));
  var defaultCorsHeaders = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'access-control-allow-headers': 'content-type, accept',
    'access-control-max-age': 10, // Seconds.
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
  var headers = defaultCorsHeaders;

  // The outgoing status.
  var urlKeys = {
    '/': true,
    '/styles/styles.css': true,
    '/bower_components/jquery/dist/jquery.js': true,
    '/scripts/app.js': true,
    '/favicon.ico': true,
    '/styles/styles.css': true
  };

  if (!urlKeys[request.url] && !request.url.startsWith('/classes/messages')) {
    response.writeHead(404, headers);
    response.end();
  }


  if (request.method === 'POST') {
    if (request.url.startsWith('/classes/messages')) {
      response.writeHead(201, headers);
      request.on('data', (json) => {
        var message = JSON.parse(json);
        message.createdAt = Date.now();
        body.results.unshift(message);
      });
      response.end(JSON.stringify(body));
    }

  } else if (request.method === 'GET') {
    if (request.url.startsWith('/classes/messages')) {
      response.writeHead(200, headers);
      response.end(JSON.stringify(body));
    } else {
      var filePath = '../client/client';
      if (request.url === '/') {
        headers['Content-Type'] = 'text/html';
        filePath += '/index.html';
      } else if (request.url.endsWith('.js')) {
        headers['Content-Type'] = 'text/javascript';
        filePath += request.url;
      } else if (request.url.endsWith('.css')) {
        headers['Content-Type'] = 'text/css';
        filePath += request.url;
      }
      fs.readFile(filePath, 'utf8', function (err, html) {
        if (err) {
          console.log(err);
          response.writeHead(500, headers);
          response.end();
        } else {
          response.writeHead(200, headers);
          response.write(html);
          response.end();
        }
      });
    }
    // } else if (request.url === '/') {
    //   headers['Content-Type'] = 'text/html';
    //   fs.readFile('../client/client/index.html', 'utf8', function (err, html) {
    //     if (err) {
    //       console.log(err);
    //       response.writeHead(500, headers);
    //       response.end();
    //     } else {
    //       response.writeHead(200, headers);
    //       response.write(html);
    //       response.end();
    //     }
    //   });
    // } else if (request.url.endsWith('.js')) {
    //   headers['Content-Type'] = 'text/javascript';
    //   fs.readFile(`../client/client${request.url}`, 'utf8', function (err, html) {
    //     if (err) {
    //       console.log(err);
    //       response.writeHead(500, headers);
    //       response.end();
    //     } else {
    //       response.writeHead(200, headers);
    //       response.write(html);
    //       response.end();
    //     }
    //   });
    // } else if (request.url.endsWith('.css')) {
    //   headers['Content-Type'] = 'text/css';
      // fs.readFile(`../client/client${request.url}`, 'utf8', function (err, html) {
      //   if (err) {
      //     console.log(err);
      //     response.writeHead(500, headers);
      //     response.end();
      //   } else {
      //     response.writeHead(200, headers);
      //     response.write(html);
      //     response.end();
      //   }
      // });
    // }
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
