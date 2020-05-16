module.exports = function (expressApp) {
  const sqlite = require('sqlite3').verbose();
  const dbPath = '/home/pi/Giess-o-mat/giessomat_db.db'
  const db = new sqlite.Database(dbPath, (err) => {
    if (err) {
      return console.log(err.message);
    }
    console.log('Connected to SQLite Database');
  });

  expressApp.get('/sensordata/current', (req, res) => {
    console.log(
      'GET ' + req.protocol + '://' + req.get('host') + req.originalUrl
    );
    db.get(
      `SELECT * FROM sensor_data ORDER BY Timestamp DESC LIMIT 1`,
      (err, row) => {
        if (err) {
          return console.log(err.message);
        }
        res.json(row);
      }
    );
  });

  expressApp.get('/sensordata/:sensor/:hours', (req, res) => {
    let sensor = req.params.sensor;
    let hours = req.params.hours;
    console.log(
      'GET ' + req.protocol + '://' + req.get('host') + req.originalUrl
    );
    db.all(
      `SELECT ? FROM sensor_data WHERE datetime(Timestamp) >=datetime('now', '-` +
      hours +
      ` Hour')`,
      [sensor],
      (err, rows) => {
        if (err) {
          return console.log(err.message);
        }
        res.json(rows);
      }
    );
  });
};
