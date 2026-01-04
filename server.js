const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const upload = multer();

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.static(__dirname));

// =====================
// GMAIL TRANSPORTER
// =====================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// =====================
// FŐ OLDAL
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// =====================
// TESZT EMAIL
// =====================
app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"Azonosító lap" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "TESZT EMAIL",
      text: "Ha ezt megkaptad, a Gmail küldés működik."
    });

    res.send("Teszt email elküldve");
  } catch (err) {
    console.error("EMAIL HIBA:", err);
    res.status(500).send("Email hiba");
  }
});

// =====================
// PDF EMAIL KÜLDÉS (CSAK PDF)
// =====================
app.post("/send-pdf", upload.single("pdf"), async (req, res) => {
  try {
    const { ugyfelEmail } = req.body;

    if (!ugyfelEmail || !req.file) {
      return res.status(400).send("Hiányzó adat");
    }

    await transporter.sendMail({
      from: `"Azonosító lap" <${process.env.GMAIL_USER}>`,
      to: ugyfelEmail,
      bcc: process.env.GMAIL_USER,

      subject: "Azonosító lap – PDF",

      // ===== EMAIL SZÖVEG =====
      text: `Tisztelt Gazdi!

Köszönjük, hogy minket választott ebben a nehéz időszakban.
Őszinte részvétünket fejezzük ki kisállata elvesztése miatt.

Mellékelten küldjük az azonosító lapot PDF formátumban.

Amennyiben bármilyen kérdése merülne fel, vagy további segítségre lenne szüksége,
forduljon hozzánk bizalommal.

Üdvözlettel:
Budai Tamás`,

      // ===== PDF CSATOLMÁNY =====
      attachments: [
        {
          filename: req.file.originalname,
          content: req.file.buffer,
          contentType: "application/pdf"
        }
      ]
    });

    res.send("Email elküldve");
  } catch (err) {
    console.error("EMAIL KÜLDÉSI HIBA:", err);
    res.status(500).send("Email küldési hiba");
  }
});

// =====================
// SERVER INDÍTÁS
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Szerver fut a következő porton:", PORT);
});
