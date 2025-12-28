const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const { Resend } = require("resend");

const app = express();
const upload = multer();

// 🔴 CSAK IDE kell az API KEY (Railway ENV-ben is!)
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// TESZT EMAIL
app.get("/test-email", async (req, res) => {
  try {
    await resend.emails.send({
      from: "Azonosító lap <no-reply@resend.dev>",
      to: ["azonisitolap@gmail.com"],
      subject: "Teszt email",
      text: "Ha ezt megkaptad, működik a Railway + Resend."
    });
    res.send("Teszt email elküldve");
  } catch (e) {
    console.error(e);
    res.status(500).send("Email hiba");
  }
});

// PDF NÉLKÜL, csak email (most ez stabil)
app.post("/send-pdf", upload.any(), async (req, res) => {
  try {
    const { ugyfelEmail } = req.body;
    if (!ugyfelEmail) return res.status(400).send("Nincs email");

    await resend.emails.send({
      from: "Azonosító lap <no-reply@resend.dev>",
      to: [ugyfelEmail, "azonisitolap@gmail.com"],
      subject: "Azonosító lap",
      text: "Az űrlap sikeresen elküldve."
    });

    res.send("Email elküldve");
  } catch (e) {
    console.error(e);
    res.status(500).send("Szerver hiba");
  }
});

// 🔴 EZ A LÉNYEG
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Szerver fut:", PORT);
});
