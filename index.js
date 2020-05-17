const SimpleNodeLogger = require('simple-node-logger'),
  opts = {
    logFilePath: './giessomat-apiserver.log',
    timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS',
  };

log = SimpleNodeLogger.createSimpleFileLogger(opts);
const express = require('express');
var bodyParser = require('body-parser');

log.info('Starting Giess-o-mat API Web Server...');
let api = require('./api');
let app = express();
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
api(app);
app.listen(8090);
log.info('Giess-o-mat API Web Server is running on port 8090');
