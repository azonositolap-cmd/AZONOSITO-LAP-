const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const { Resend } = require("resend");

const app = express();
const upload = multer();

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/test-email", async (req, res) => {
  try {
    await resend.emails.send({
      from: "Azonosító lap <no-reply@resend.dev>",
      to: ["azonisitolap@gmail.com"],
      subject: "Teszt email",
      text: "Ez egy teszt email Render + Resend alól."
    });

    res.send("Teszt email elküldve");
  } catch (e) {
    console.error(e);
    res.status(500).send("Hiba email küldéskor");
  }
});

app.post("/send-pdf", upload.none(), async (req, res) => {
  const { ugyfelEmail, gazdaNev = "", cim = "" } = req.body;

  if (!ugyfelEmail) {
    return res.status(400).send("Nincs email");
  }

  const doc = new PDFDocument();
  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", async () => {
    const pdf = Buffer.concat(buffers);

    await resend.emails.send({
      from: "Azonosító lap <no-reply@resend.dev>",
      to: [ugyfelEmail, "azonisitolap@gmail.com"],
      subject: "Azonosító lap",
      text: "Csatolva az azonosító lap.",
      attachments: [
        {
          filename: "azonosito-lap.pdf",
          content: pdf.toString("base64")
        }
      ]
    });

    res.send("PDF elküldve");
  });

  doc.text("AZONOSÍTÓ LAP");
  doc.text(`Gazda: ${gazdaNev}`);
  doc.text(`Cím: ${cim}`);
  doc.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Szerver fut:", PORT));
