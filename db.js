const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./warehouse_devices.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS sensor_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT,
      warehouse TEXT,
      temperature REAL,
      humidity REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
