const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const { Resend } = require("resend");

const app = express();
const upload = multer();

if (!process.env.RESEND_API_KEY) {
  throw new Error("HIÁNYZIK A RESEND_API_KEY ENV VÁLTOZÓ");
}

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* ===== TESZT EMAIL ===== */
app.get("/test-email", async (req, res) => {
  try {
    await resend.emails.send({
      from: "Azonosító lap <no-reply@resend.dev>",
      to: ["azonisitolap@gmail.com"],
      subject: "TESZT EMAIL",
      html: "<strong>Ha ezt látod, az email küldés működik.</strong>"
    });

    res.send("Teszt email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).send("Email küldési hiba");
  }
});

/* ===== ŰRLAP EMAIL ===== */
app.post("/send-pdf", upload.none(), async (req, res) => {
  try {
    const { ugyfelEmail, gazdaNev, cim } = req.body;

    if (!ugyfelEmail) {
      return res.status(400).send("Hiányzó email");
    }

    await resend.emails.send({
      from: "Azonosító lap <no-reply@resend.dev>",
      to: [ugyfelEmail, "azonisitolap@gmail.com"],
      subject: "Azonosító lap",
      html: `
        <p><strong>Gazda neve:</strong> ${gazdaNev || "-"}</p>
        <p><strong>Cím:</strong> ${cim || "-"}</p>
        <p>Az azonosító lap sikeresen elkészült.</p>
      `
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
