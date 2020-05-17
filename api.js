module.exports = function (expressApp) {
  const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
      logFilePath: './giessomat-apiserver.log',
      timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS',
    };

  log = SimpleNodeLogger.createSimpleFileLogger(opts);
  log.setLevel('debug');
  const sqlite = require('sqlite3').verbose();
  const fs = require('fs');
  const light_settings_path = './light_settings.json';
  const ventilation_settings_path = './ventilation_settings.json';
  const irrigation_settings_path = './irrigation_settings.json';
  const dbPath = '/home/pi/Giess-o-mat/giessomat_db.db';
  const db = new sqlite.Database(dbPath, (err) => {
    if (err) {
      return log.error(err.message);
    }
    log.info('Connected to SQLite Database');
  });

  expressApp.get('/sensordata/current', (req, res) => {
    log.debug(
      'GET ' + req.protocol + '://' + req.get('host') + req.originalUrl
    );
    db.get(
      `SELECT * FROM sensor_data ORDER BY Timestamp DESC LIMIT 1`,
      (err, row) => {
        if (err) {
          return log.error(err.message);
        }
        res.json(row);
      }
    );
  });

  expressApp.get('/sensordata/:sensor/:hours', (req, res) => {
    let sensor = req.params.sensor;
    let hours = req.params.hours;
    log.debug(
      'GET ' + req.protocol + '://' + req.get('host') + req.originalUrl
    );
    db.all(
      `SELECT ? FROM sensor_data WHERE datetime(Timestamp) >=datetime('now', '-` +
        hours +
        ` Hour')`,
      [sensor],
      (err, rows) => {
        if (err) {
          return log.error(err.message);
        }
        res.json(rows);
      }
    );
  });

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
};
