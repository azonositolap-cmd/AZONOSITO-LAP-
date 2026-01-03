const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();
const upload = multer();

app.use(cors());
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================
   GMAIL TRANSPORTER
   ========================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "azonositolap@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

/* =========================
   TESZT EMAIL
   ========================= */
app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: "Azonosító lap <azonisitolap@gmail.com>",
      to: "azonisitolap@gmail.com",
      subject: "TESZT EMAIL",
      text: "Ha ezt megkaptad, a Gmail email küldés MŰKÖDIK."
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
    const { ugyfelEmail } = req.body;

    if (!ugyfelEmail) {
      return res.status(400).send("Hiányzó email cím");
    }

    await transporter.sendMail({
      from: "Azonosító lap <azonisitolap@gmail.com>",
      to: [ugyfelEmail, "azonisitolap@gmail.com"],
      subject: "Azonosító lap",
      text: "Az azonosító lap sikeresen elküldve."
    });

    res.send("Email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).send("Szerver hiba");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Szerver fut a porton:", PORT);
});
