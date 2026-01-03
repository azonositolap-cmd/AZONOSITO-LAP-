const express = require("express");
const cors = require("cors");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const upload = multer();

app.use(cors());
app.use(express.static(__dirname));

// ======================
// GMAIL TRANSPORT
// ======================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,       // pl: azonositolap@gmail.com
    pass: process.env.GMAIL_APP_PASS    // 16 karakteres app jelszó
  }
});

// ======================
// TESZT EMAIL
// ======================
app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"Azonosító lap" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "✅ Teszt email",
      text: "Ha ezt megkaptad, a szerverről működik az email küldés."
    });

    res.send("Teszt email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).send("Email hiba");
  }
});

// ======================
// ŰRLAP → PDF → EMAIL
// ======================
app.post("/send-pdf", upload.any(), async (req, res) => {
  try {
    const { ugyfelEmail, gazdaNev = "", cim = "" } = req.body;

    if (!ugyfelEmail) {
      return res.status(400).send("Hiányzó email");
    }

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      await transporter.sendMail({
        from: `"Azonosító lap" <${process.env.GMAIL_USER}>`,
        to: [ugyfelEmail, process.env.GMAIL_USER],
        subject: "Azonosító lap",
        text: `Csatolva küldjük az azonosító lapot.

Gazda neve: ${gazdaNev}
Cím: ${cim}`,
        attachments: [
          {
            filename: "azonosito_lap.pdf",
            content: pdfBuffer
          }
        ]
      });

      res.send("PDF elkészült és elküldve");
    });

    // PDF TARTALOM
    doc.fontSize(18).text("AZONOSÍTÓ LAP", { align: "center" });
    doc.moveDown();
    doc.text(`Gazda neve: ${gazdaNev}`);
    doc.text(`Cím: ${cim}`);
    doc.moveDown(2);
    doc.text("Köszönjük, hogy minket választott.");

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).send("Szerver hiba");
  }
});

// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Szerver fut porton:", PORT);
});
