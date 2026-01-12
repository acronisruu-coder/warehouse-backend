process.env.TZ = "Asia/Ulaanbaatar";

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
 * ESP32 → SENSOR DATA
 * =============================== */
app.post("/api/sensor-data", (req, res) => {
  const { sensor_id, warehouse, temperature, humidity } = req.body;

  if (!sensor_id || temperature === undefined) {
    return res
      .status(400)
      .json({ error: "sensor_id and temperature required" });
  }

  // ⚠️ DB-д device_id гэж хадгална
  const sql = `
    INSERT INTO sensor_data
    (device_id, warehouse, temperature, humidity)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    sql,
    [sensor_id, warehouse || null, temperature, humidity || null],
    err => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ status: "saved" });
    }
  );
});

/* ===============================
 * FRONTEND → LATEST
 * =============================== */
app.get("/api/latest", (req, res) => {
  const sql = `
    SELECT
      device_id AS sensor_id,
      warehouse,
      temperature,
      humidity,
      created_at
    FROM sensor_data
    ORDER BY created_at DESC
  `;

  db.all(sql, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }

    const latest = {};
    rows.forEach(r => {
      if (!latest[r.sensor_id]) latest[r.sensor_id] = r;
    });

    res.json(Object.values(latest));
  });
});

/* ===============================
 * START
 * =============================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("✅ Backend running on port", PORT)
);
