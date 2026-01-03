const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();
const upload = multer();

app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use(express.json());

/* =========================
   GMAIL EMAIL BEÁLLÍTÁS
   ========================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,      // pl: azonositolap@gmail.com
    pass: process.env.GMAIL_APP_PASS   // app jelszó (NEM sima gmail jelszó)
  }
});

/* =========================
   FŐOLDAL
   ========================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================
   TESZT EMAIL
   ========================= */
app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"Azonosító lap" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "✅ Gmail teszt",
      text: "Ha ezt megkaptad, a Gmail email küldés működik."
    });

    res.send("Teszt email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).send("Email hiba");
  }
});

/* =========================
   ŰRLAP → EMAIL
   ========================= */
app.post("/send-pdf", upload.any(), async (req, res) => {
  try {
    const { ugyfelEmail, gazdaNev = "", cim = "" } = req.body;

    if (!ugyfelEmail) {
      return res.status(400).send("Hiányzó email");
    }

    await transporter.sendMail({
      from: `"Azonosító lap" <${process.env.GMAIL_USER}>`,
      to: [ugyfelEmail, process.env.GMAIL_USER],
      subject: "Azonosító lap",
      text: `Gazda neve: ${gazdaNev}\nCím: ${cim}\n\nAz azonosító lap rögzítve.`
    });

    res.send("Email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).send("Szerver hiba");
  }
});

/* =========================
   INDÍTÁS
   ========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Szerver fut a porton:", PORT);
});
