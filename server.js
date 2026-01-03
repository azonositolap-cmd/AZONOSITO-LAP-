const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.static("."));

/* =========================
   GMAIL TRANSPORT
   ========================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,        // pl: azonositolap@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD // app jelszó
  }
});

/* =========================
   TESZT EMAIL
   ========================= */
app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"Azonosító lap" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "Teszt email – OK",
      text: "Ha ezt megkaptad, a szerver email küldése működik."
    });

    res.send("Teszt email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).send("Teszt email hiba");
  }
});

/* =========================
   PDF + EMAIL
   ========================= */
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
          filename: req.file.originalname || "azonosito_lap.pdf",
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

/* =========================
   SERVER START
   ========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Szerver fut porton:", PORT);
});
