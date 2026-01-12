process.env.TZ = "Asia/Ulaanbaatar";

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/* =================================================
 * 1️⃣ ESP32 → SENSOR DATA RECEIVE
 * ================================================= */
app.post("/api/sensor-data", (req, res) => {
  const { sensor_id, warehouse, temperature, humidity } = req.body;

  if (!sensor_id || temperature === undefined) {
    return res.status(400).json({
      error: "sensor_id and temperature required"
    });
  }

  const sql = `
    INSERT INTO sensor_data
    (sensor_id, warehouse, temperature, humidity)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      sensor_id,
      warehouse || null,
      temperature,
      humidity || null
    ],
    err => {
      if (err) {
        console.error("DB INSERT ERROR:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ status: "saved" });
    }
  );
});

/* =================================================
 * 2️⃣ LATEST DATA PER SENSOR
 * ================================================= */
app.get("/api/latest", (req, res) => {
  const sql = `
    SELECT
      sensor_id,
      warehouse,
      temperature,
      humidity,
      created_at
    FROM sensor_data
    ORDER BY created_at DESC
  `;

  db.all(sql, (err, rows) => {
    if (err) {
      console.error("DB SELECT ERROR:", err.message);
      return res.status(500).json({ error: err.message });
    }

    // sensor_id бүрийн хамгийн сүүлийн бичлэг
    const latest = {};
    rows.forEach(row => {
      if (!latest[row.sensor_id]) {
        latest[row.sensor_id] = row;
      }
    });

    res.json(Object.values(latest));
  });
});

/* =================================================
 * START SERVER
 * ================================================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ Backend running on port", PORT);
});
