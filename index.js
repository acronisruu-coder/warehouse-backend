process.env.TZ = "Asia/Ulaanbaatar";

const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

/* 1️⃣ Sensor дата хүлээж авах */
app.post('/api/sensor-data', (req, res) => {
  const { device_id, temperature, humidity, battery } = req.body;

  if (!device_id || temperature === undefined) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  const sql = `
    INSERT INTO sensor_data (device_id, temperature, humidity, battery)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [device_id, temperature, humidity, battery], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ status: 'saved' });
  });
});

/* 2️⃣ Сүүлийн дата авах */
app.get('/api/latest', (req, res) => {
  db.all(`
  SELECT
    id,
    device_id,
    temperature,
    humidity,
    battery,
    datetime(created_at, '+8 hours') AS created_at
  FROM sensor_data
  ORDER BY created_at DESC
  LIMIT 10
`, (err, rows) => {
  res.json(rows);
});
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Backend running on port 3000");
});

