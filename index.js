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
  const { warehouse, temperature, humidity } = req.body;

  if (temperature === undefined) {
    return res.status(400).json({ error: "temperature required" });
  }

  const sql = `
    INSERT INTO sensor_data
    (warehouse, temperature, humidity)
    VALUES (?, ?, ?)
  `;

  db.run(
    sql,
    [
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
 * 2️⃣ ХАМГИЙН СҮҮЛИЙН DATA АВАХ
 * ================================================= */
app.get("/api/latest", (req, res) => {
  const sql = `
    SELECT
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
    res.json(rows);
  });
});

/* =================================================
 * START SERVER
 * ================================================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ Backend running on port", PORT);
});
