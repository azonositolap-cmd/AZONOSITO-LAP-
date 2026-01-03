const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const { Resend } = require("resend");

const app = express();
const upload = multer();

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* 🔹 TESZT EMAIL */
app.get("/test-email", async (req, res) => {
  try {
    await resend.emails.send({
      from: "Azonosító lap <onboarding@resend.dev>",
      to: ["azonositolap@gmail.com"],
      subject: "TESZT EMAIL",
      html: "<p>Ha ezt megkaptad, a Resend MŰKÖDIK.</p>",
    });

    res.send("Teszt email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).send("Hiba az email küldésnél");
  }
});

/* 🔹 ŰRLAP → EMAIL */
app.post("/send-pdf", upload.any(), async (req, res) => {
  const { ugyfelEmail } = req.body;

  if (!ugyfelEmail) {
    return res.status(400).send("Hiányzó email");
  }

  try {
    await resend.emails.send({
      from: "Azonosító lap <onboarding@resend.dev>",
      to: [ugyfelEmail, "azonisitolap@gmail.com"],
      subject: "Azonosító lap",
      html: "<p>Az azonosító lap sikeresen elkészült.</p>",
    });

    res.send("Email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).send("Email küldési hiba");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Szerver fut a porton:", PORT);
});
