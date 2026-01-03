const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();
const upload = multer();

// ===== GMAIL SMTP (APP JELSZÓ KELL) =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "azonositolap@gmail.com",       // <-- SAJÁT GMAIL
    pass: "lgou ixld tyng rcnz"            // <-- APP JELSZÓ
  }
});

app.use(cors());
app.use(express.static(__dirname));

// ===== TESZT =====
app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: "Azonosító lap <azonisitolap@gmail.com>",
      to: "azonisitolap@gmail.com",
      subject: "Teszt email",
      text: "Ha ezt megkaptad, az email küldés működik."
    });
    res.send("Teszt email elküldve");
  } catch (e) {
    console.error(e);
    res.status(500).send("Email hiba");
  }
});

// ===== PDF KÜLDÉS =====
app.post("/send-pdf", upload.single("pdf"), async (req, res) => {
  try {
    const { ugyfelEmail, fileName } = req.body;

    if (!req.file || !ugyfelEmail) {
      return res.status(400).send("Hiányzó adat");
    }

    await transporter.sendMail({
      from: "Azonosító lap <azonisitolap@gmail.com>",
      to: [ugyfelEmail, "azonisitolap@gmail.com"],
      subject: "Azonosító lap",
      text: "Csatolva küldjük az azonosító lapot.",
      attachments: [
        {
          filename: fileName || "azonosito_lap.pdf",
          content: req.file.buffer
        }
      ]
    });

    res.send("Email elküldve");
  } catch (e) {
    console.error(e);
    res.status(500).send("Email küldési hiba");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Szerver fut:", PORT);
});
