module.exports = function (expressApp) {
  // Set up a logger to write log output to a file
  const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
      //logFilePath: '/home/pi/Giess-o-mat-Webserver/giessomat-apiserver.log',
      logFilePath: process.env.API_SERVER_LOG_FILE_PATH,
      timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS',
    };

  log = SimpleNodeLogger.createSimpleFileLogger(opts);
  // Set log level to debug
  log.setLevel('debug');
  // Load required dependencies
  const sqlite = require('sqlite3').verbose();
  const fs = require('fs');
  // Define file paths for settings
  //const light_settings_path = '/home/pi/Giess-o-mat-Webserver/light_settings.json';
  //const ventilation_settings_path = '/home/pi/Giess-o-mat-Webserver/ventilation_settings.json';
  //const irrigation_settings_path = '/home/pi/Giess-o-mat-Webserver/irrigation_settings.json';
  const light_settings_path = process.env.API_SERVER_LIGHT_SETTINGS_PATH;
  const ventilation_settings_path =
    process.env.API_SERVER_VENTILATION_SETTINGS_PATH;
  const irrigation_settings_path =
    process.env.API_SERVER_IRRIGATION_SETTINGS_PATH;
  // Define file path for SQLite database
  //const dbPath = '/home/pi/Giess-o-mat/giessomat_db.db';
  const dbPath = process.env.API_SERVER_DB_FILE_PATH;
  // Connect to database
  const db = new sqlite.Database(dbPath, (err) => {
    if (err) {
      return log.error(err.message);
    }
    log.info('Connected to SQLite Database');
  });

  // GET Method to query the latest sensor data and return as JSON
  expressApp.get('/sensordata/current', (req, res) => {
    log.debug(
      'GET ' + req.protocol + '://' + req.get('host') + req.originalUrl
    );
    db.get(
      `SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1`,
      (err, row) => {
        if (err) {
          return log.error(err.message);
        }
        res.json(row);
      }
    );
  });

  // GET Method to query the the sensor data of a specific sensor in for the last x hours and return as JSON
  expressApp.get('/sensordata/:sensor/:hours', (req, res) => {
    let sensor = req.params.sensor;
    let hours = req.params.hours;
    log.debug(
      'GET ' + req.protocol + '://' + req.get('host') + req.originalUrl
    );
    db.all(
      `SELECT timestamp,` +
        sensor +
        ` FROM sensor_data WHERE datetime(timestamp) >=datetime('now', '-` +
        hours +
        ` Hour')`,
      (err, rows) => {
        if (err) {
          return log.error(err.message);
        }
        res.json(rows);
      }
    );
  });

  // GET Method to query the the max value of a  specific sensor for the last x hours and return as JSON
  expressApp.get('/sensordata/:sensor/:hours/max', (req, res) => {
    let sensor = req.params.sensor;
    let hours = req.params.hours;
    log.debug(
      'GET ' + req.protocol + '://' + req.get('host') + req.originalUrl
    );
    db.all(
      `SELECT timestamp, MAX(` +
        sensor +
        `) FROM sensor_data WHERE datetime(timestamp) >=datetime('now', '-` +
        hours +
        ` Hour')`,
      (err, rows) => {
        if (err) {
          return log.error(err.message);
        }
        res.json(rows);
      }
    );
  });

  // GET Method to query the the min value of a  specific sensor for the last x hours and return as JSON
  expressApp.get('/sensordata/:sensor/:hours/min', (req, res) => {
    let sensor = req.params.sensor;
    let hours = req.params.hours;
    log.debug(
      'GET ' + req.protocol + '://' + req.get('host') + req.originalUrl
    );
    db.all(
      `SELECT timestamp, MIN(` +
        sensor +
        `) FROM sensor_data WHERE datetime(timestamp) >=datetime('now', '-` +
        hours +
        ` Hour')`,
      (err, rows) => {
        if (err) {
          return log.error(err.message);
        }
        res.json(rows);
      }
    );
  });

  // POST Method to write the settings of a topic (light, ventilation, irrigation) to a JSON file
  expressApp.post('/settings/:topic', (req, res) => {
    let topic = req.params.topic;
    let settings_path = '';
    if (topic == 'light') {
      settings_path = light_settings_path;
    } else if (topic == 'ventilation') {
      settings_path = ventilation_settings_path;
    } else if (topic == 'irrigation') {
      settings_path = irrigation_settings_path;
    }
    log.debug(
      'POST ' + req.protocol + '://' + req.get('host') + req.originalUrl
    );

    function writeSettings(path) {
      fs.writeFile(path, JSON.stringify(req.body, null, 2), function writeJSON(
        err
      ) {
        if (err) {
          log.error(err);
          res.sendStatus(500);
        }
        log.info('Recieved new lighting settings:' + JSON.stringify(req.body));
        log.debug('Writing settings to ' + path);
        res.sendStatus(200);
      });
    }

    writeSettings(settings_path);
  });

  // GET Method to get the settings of the topic (light, ventilation, irrigation)
  expressApp.get('/settings/:topic', (req, res) => {
    let topic = req.params.topic;
    let settings_path = '';
    if (topic == 'light') {
      settings_path = light_settings_path;
    } else if (topic == 'ventilation') {
      settings_path = ventilation_settings_path;
    } else if (topic == 'irrigation') {
      settings_path = irrigation_settings_path;
    }
    log.debug(
      'GET ' + req.protocol + '://' + req.get('host') + req.originalUrl
    );
    fs.readFile(settings_path, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }
      res.send(JSON.parse(data));
    });
  });

    // GET Method to query the latest sensor data and return as JSON
    expressApp.get('/log', (req, res) => {
      log.debug(
        'GET ' + req.protocol + '://' + req.get('host') + req.originalUrl
      );
      db.all(
        `SELECT * FROM log ORDER BY timestamp DESC LIMIT 1`,
        (err, rows) => {
          if (err) {
            return log.error(err.message);
          }
          res.json(rows);
        }
      );
    });
};
