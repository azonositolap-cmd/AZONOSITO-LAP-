const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const upload = multer();

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
// PDF KÜLDÉS
// =====================
app.post("/send-pdf", upload.single("pdf"), async (req, res) => {
  try {
    const { ugyfelEmail } = req.body;

    if (!ugyfelEmail || !req.file) {
      return res.status(400).send("Hiányzó adat");
    }

    await transporter.sendMail({
      from: `"Azonosító lap" <${process.env.GMAIL_USER}>`,
      to: [ugyfelEmail, process.env.GMAIL_USER],
      subject: "Azonosító lap",
      text: "Csatolva küldjük az azonosító lapot.",
      attachments: [
        {
          filename: req.file.originalname,
          content: req.file.buffer
        }
      ]
    });

    res.send("Email elküldve");
  } catch (err) {
    console.error("PDF EMAIL HIBA:", err);
    res.status(500).send("Email küldési hiba");
  }
});

// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Szerver fut:", PORT);
});
