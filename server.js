const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const { Resend } = require("resend");

const app = express();
const upload = multer();

// 🔐 Railway-ben környezeti változó lesz
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🔹 TESZT EMAIL
app.get("/test-email", async (req, res) => {
  try {
    await resend.emails.send({
      from: "Azonosító lap <no-reply@resend.dev>",
      to: ["azonisitolap@gmail.com"],
      subject: "Teszt email",
      text: "Ha ezt megkaptad, az email küldés működik."
    });

    res.send("Teszt email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).send("Email hiba");
  }
});

// 🔹 ŰRLAP → PDF → EMAIL
app.post("/send-pdf", upload.any(), async (req, res) => {
  try {
    const { ugyfelEmail, gazdaNev = "", cim = "" } = req.body;

    if (!ugyfelEmail) {
      return res.status(400).send("Hiányzó email cím");
    }

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      await resend.emails.send({
        from: "Azonosító lap <no-reply@resend.dev>",
        to: [ugyfelEmail, "azonisitolap@gmail.com"],
        subject: "Azonosító lap",
        text: "Csatolva küldjük az azonosító lapot.",
        attachments: [
          {
            filename: "azonosito_lap.pdf",
            content: pdfBuffer.toString("base64")
          }
        ]
      });

      res.send("Email elküldve");
    });

    doc.fontSize(18).text("AZONOSÍTÓ LAP", { align: "center" });
    doc.moveDown();
    doc.text(`Gazda neve: ${gazdaNev}`);
    doc.text(`Cím: ${cim}`);
    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).send("Szerver hiba");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Szerver fut:", PORT);
});
