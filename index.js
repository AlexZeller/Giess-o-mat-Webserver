require('log-timestamp');
const express = require('express');
let api = require('./api');

let app = express();
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

//Initialize HTTP Server
api(app);
app.listen(8090);
console.log('HTTP Server is running on port 8090');
