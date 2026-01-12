process.env.TZ = "Asia/Ulaanbaatar";

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/* =================================================
 * 1️⃣ SENSOR DATA ХҮЛЭЭЖ АВАХ (ESP32 → BACKEND)
 * ================================================= */
app.post("/api/sensor-data", (req, res) => {
  const {
    device_id,
    sensor_id,
    warehouse,
    temperature,
    humidity,
    battery
  } = req.body;

  // validation
  if (!device_id || !sensor_id || temperature === undefined) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const sql = `
    INSERT INTO sensor_data
    (device_id, sensor_id, warehouse, temperature, humidity, battery)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      device_id,
      sensor_id,
      warehouse || null,
      temperature,
      humidity || null,
      battery || null
    ],
    (err) => {
      if (err) {
        console.error("DB INSERT ERROR:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ status: "saved" });
    }
  );
});

/* =================================================
 * 2️⃣ SENSOR ТУС БҮРИЙН ХАМГИЙН СҮҮЛИЙН DATA АВАХ
 * ================================================= */
app.get("/api/latest", (req, res) => {
  const sql = `
    SELECT
      device_id,
      sensor_id,
      warehouse,
      temperature,
      humidity,
      battery,
      datetime(created_at, '+8 hours') AS time
    FROM sensor_data
    ORDER BY created_at DESC
  `;

  db.all(sql, (err, rows) => {
    if (err) {
      console.error("DB SELECT ERROR:", err.message);
      return res.status(500).json({ error: err.message });
    }

    // sensor_id бүрийн хамгийн сүүлийн бичлэг
    const latestBySensor = {};
    rows.forEach(r => {
      if (!latestBySensor[r.sensor_id]) {
        latestBySensor[r.sensor_id] = r;
      }
    });

    res.json(Object.values(latestBySensor));
  });
});

/* =================================================
 * START SERVER
 * ================================================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ Backend running on port", PORT);
});
