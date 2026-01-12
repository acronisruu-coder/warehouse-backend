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
  const { device_id, warehouse, temperature, humidity } = req.body;

  if (!device_id || temperature === undefined) {
    return res
      .status(400)
      .json({ error: "device_id and temperature required" });
  }

  const sql = `
    INSERT INTO sensor_data
    (device_id, warehouse, temperature, humidity)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      device_id,
      warehouse || null,
      temperature,
      humidity || null
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
 * 2️⃣ DEVICE ТУС БҮРИЙН ХАМГИЙН СҮҮЛИЙН DATA
 * ================================================= */
app.get("/api/latest", (req, res) => {
  const sql = `
    SELECT
      device_id,
      warehouse,
      temperature,
      humidity,
      datetime(created_at, '+8 hours') AS time
    FROM sensor_data
    ORDER BY created_at DESC
  `;

  db.all(sql, (err, rows) => {
    if (err) {
      console.error("DB SELECT ERROR:", err.message);
      return res.status(500).json({ error: err.message });
    }

    // device_id бүрийн хамгийн сүүлийн бичлэг
    const latestByDevice = {};
    rows.forEach(row => {
      if (!latestByDevice[row.device_id]) {
        latestByDevice[row.device_id] = row;
      }
    });

    res.json(Object.values(latestByDevice));
  });
});

/* =================================================
 * START SERVER
 * ================================================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ Backend running on port", PORT);
});
