const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();
const upload = multer();

// =====================
// GMAIL EMAIL BEÁLLÍTÁS
// =====================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "azonisitolap@gmail.com",
    pass: "danv uwul sqyy mpid"
  }
});

// =====================
// ALAP BEÁLLÍTÁSOK
// =====================
app.use(cors());
app.use(express.static(__dirname));

// =====================
// FŐ OLDAL
// =====================
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// =====================
// TESZT EMAIL (BÖNGÉSZŐBŐL)
// =====================
app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: '"Azonosító lap" <azonisitolap@gmail.com>',
      to: "azonisitolap@gmail.com",
      subject: "Teszt email",
      text: "Ha ezt megkaptad, az email küldés működik."
    });

    res.send("Teszt email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).send("Email hiba");
  }
});

// =====================
// ŰRLAP → PDF → EMAIL
// =====================
app.post("/send-pdf", upload.single("pdf"), async (req, res) => {
  try {
    const { ugyfelEmail } = req.body;

    if (!ugyfelEmail || !req.file) {
      return res.status(400).send("Hiányzó adat");
    }

    await transporter.sendMail({
      from: '"Azonosító lap" <azonisitolap@gmail.com>',
      to: [ugyfelEmail, "azonisitolap@gmail.com"],
      subject: "Azonosító lap",
      text: "Csatolva küldjük az azonosító lapot.",
      attachments: [
        {
          filename: req.file.originalname,
          content: req.file.buffer
        }
      ]
    });

    res.send("PDF elküldve emailben");
  } catch (err) {
    console.error(err);
    res.status(500).send("Email küldési hiba");
  }
});

// =====================
// SZERVER INDÍTÁS
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Szerver fut a porton:", PORT);
});
