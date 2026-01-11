const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./warehouse.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS sensor_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT,
      temperature REAL,
      humidity REAL,
      battery REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
