// Set up a logger to write log output to a file
const SimpleNodeLogger = require('simple-node-logger'),
  opts = {
    logFilePath: './giessomat-apiserver.log',
    timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS',
  };

log = SimpleNodeLogger.createSimpleFileLogger(opts);
// Load required dependencies
const express = require('express');
var bodyParser = require('body-parser');

log.info('Starting Giess-o-mat API Web Server...');
// Require api.js
let api = require('./api');
// Set up express app
let app = express();
// Configure encoding
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
// Run express app
api(app);
app.listen(8090);
log.info('Giess-o-mat API Web Server is running on port 8090');
