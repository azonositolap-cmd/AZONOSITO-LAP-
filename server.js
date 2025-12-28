const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const { Resend } = require("resend");

const app = express();
const upload = multer();

// 🔴 A RESEND API KULCSOT NEM IDE ÍRJUK BE!
// Railway → Variables → RESEND_API_KEY
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.static(path.join(__dirname)));

// HTML kiszolgálása
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🔹 TESZT EMAIL
app.get("/test-email", async (req, res) => {
  try {
    await resend.emails.send({
      from: "Azonosító lap <no-reply@resend.dev>",
      to: ["azonisitolap@gmail.com"],
      subject: "Resend teszt email",
      text: "Ha ezt megkaptad, a Resend működik."
    });

    res.send("Teszt email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).send("Email hiba");
  }
});

// 🔹 PDF FOGADÁS + EMAIL
app.post("/send-pdf", upload.any(), async (req, res) => {
  try {
    const { ugyfelEmail, gazdaNev = "", cim = "" } = req.body;
    const pdfFile = req.files?.[0];

    if (!ugyfelEmail || !pdfFile) {
      return res.status(400).send("Hiányzó adat");
    }

    await resend.emails.send({
      from: "Azonosító lap <no-reply@resend.dev>",
      to: [ugyfelEmail, "azonisitolap@gmail.com"],
      subject: "Azonosító lap",
      text: `Csatolva küldjük az azonosító lapot.

Gazda neve: ${gazdaNev}
Cím: ${cim}`,
      attachments: [
        {
          filename: pdfFile.originalname,
          content: pdfFile.buffer.toString("base64")
        }
      ]
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
