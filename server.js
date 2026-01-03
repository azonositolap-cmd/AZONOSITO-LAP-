const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.static(__dirname));

app.post("/send-pdf", upload.single("pdf"), async (req, res) => {
  try {
    const { ugyfelEmail, cim } = req.body;
    const pdfBuffer = req.file?.buffer;

    if (!ugyfelEmail || !pdfBuffer) {
      return res.status(400).send("Hiányzó adat");
    }

    // ✅ GMAIL – APP JELSZÓ BEÍRVA
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "azonisitolap@gmail.com",
        pass: "danv uwul sqyy mpid"
      }
    });

    const datum = new Date().toLocaleDateString("hu-HU");
    const safeCim = (cim || "cim_nelkul").replace(/[^a-zA-Z0-9]+/g, "_");
    const fileName = `azonosito_lap_${datum}_${safeCim}.pdf`;

    await transporter.sendMail({
      from: `"Azonosító lap" <azonisitolap@gmail.com>`,
      to: [ugyfelEmail, "azonisitolap@gmail.com"],
      subject: "Azonosító lap",
      text:
`Mellékletben küldjük az azonosító lapot.

Köszönjük, hogy minket választott ebben a nehéz időszakban.
Őszinte részvétünket fejezzük ki.`,

      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    });

    res.send("Email elküldve");
  } catch (err) {
    console.error("EMAIL HIBA:", err);
    res.status(500).send("Email hiba");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Szerver fut a porton:", PORT);
});
