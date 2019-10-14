const fs = require('fs');

const placeholder = fs.readFileSync(`${__dirname}/../media/placeholder.png`);
const background = fs.readFileSync(`${__dirname}/../media/background.jpg`);

const getBackground = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(background);

  response.end();
};

// loads in any image with a provided name - useful for when I need to load like,,, a lotta pictures
const getImage = (request, response, url) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  const img = fs.readFileSync(`${__dirname}/..${url}`);

  if (img) {
    response.write(img);
  } else {
    response.write(placeholder);
  }

  response.end();
};


module.exports = {
  getBackground,
  getImage,
};
