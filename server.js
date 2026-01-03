const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();
const upload = multer();

// ===== GMAIL SMTP (APP JELSZÓVAL) =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,      // pl: azonositolap@gmail.com
    pass: process.env.GMAIL_APP_PASS   // app jelszó
  }
});

app.use(cors());
app.use(express.static(__dirname));

// ===== TESZT =====
app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"Azonosító lap" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "Teszt email",
      text: "Ha ezt megkaptad, a szerver működik."
    });

    res.send("Teszt email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).send("Email hiba");
  }
});

// ===== PDF FOGADÁS + KÜLDÉS =====
app.post("/send-pdf", upload.single("pdf"), async (req, res) => {
  try {
    const { ugyfelEmail } = req.body;

    if (!req.file || !ugyfelEmail) {
      return res.status(400).send("Hiányzó PDF vagy email");
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

    res.send("PDF elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).send("Email küldési hiba");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Szerver fut:", PORT);
});
