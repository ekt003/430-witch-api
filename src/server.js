const http = require('http'); // pull in http module
// url module for parsing url string
const url = require('url');
// querystring module for parsing querystrings from url
const query = require('querystring');
// pull in our custom files
const htmlHandler = require('./htmlHandler.js');
const jsonHandler = require('./dataHandler.js');
const imgHandler = require('./imageHandler.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// handle POST requests
const handlePost = (request, response, parsedUrl) => {
  // if post is to /addUser (our only POST url)
  if (parsedUrl.pathname === '/addUser') {
    const res = response;

    // uploads come in as a byte stream that we need
    // to reassemble once it's all arrived
    const body = [];

    // if the upload stream errors out, just throw a
    // a bad request and send it back
    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    // on 'data' is for each byte of data that comes in
    // from the upload. We will add it to our byte array.
    request.on('data', (chunk) => {
      body.push(chunk);
    });

    // on end of upload stream.
    request.on('end', () => {
      // combine our byte array (using Buffer.concat)
      // and convert it to a string value (in this instance)
      const bodyString = Buffer.concat(body).toString();
      // since we are getting x-www-form-urlencoded data
      // the format will be the same as querystrings
      // Parse the string into an object by field name
      const bodyParams = query.parse(bodyString);

      // pass to our addUser function
      jsonHandler.addUser(request, res, bodyParams);
    });
  }
};

const handleImage = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/media/background.jpg') {
    imgHandler.getBackground(request, response);
  } else {
    imgHandler.getImage(request, response, parsedUrl.pathname);
  }
};

// handle GET and HEAD requests,
// if just HEAD request, then just respond with the meta, otherwise give full response
const handleGet = (request, response, parsedUrl) => {
  // if its an image, handle elsewhere (for cleanliness sake)
  if (parsedUrl.pathname.indexOf('/media') !== -1) {
    handleImage(request, response, parsedUrl);
    return;
  }

  const params = query.parse(parsedUrl.query);

  // route to correct method based on url
  switch (parsedUrl.pathname) {
    case '/':
      htmlHandler.getIndex(request, response);
      break;
    case '/style.css':
      htmlHandler.getStyle(request, response);
      break;
    case '/documentation':
      htmlHandler.getDocs(request, response);
      break;
    case '/getUsers':
      if (params.name) {
        if (request.method === 'GET') {
          jsonHandler.getWitch(request, response, params);
        } else {
          // if just head, only respond with meta
          jsonHandler.respondJSONMeta(request, response, 200);
        }
      } else {
        if (request.method === 'GET') {
          jsonHandler.getUsers(request, response);
        } else {
          // if just head, only respond with meta
          jsonHandler.respondJSONMeta(request, response, 200);
        }
      }
      break;
    default:
      jsonHandler.notFound(request, response); // if unknown, respond with 404
      break;
  }
};

const onRequest = (request, response) => {
  // parse url into individual parts
  // returns an object of url parts by name
  const parsedUrl = url.parse(request.url);

  // check if method was POST, otherwise assume GET
  // for the sake of this example
  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
