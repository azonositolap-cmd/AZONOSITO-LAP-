const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Resend } = require("resend");

const app = express();
const upload = multer();

// 🔴 NEM IDE ÍRJUK AZ API KULCSOT
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

/* ===== TESZT EMAIL (PDF NÉLKÜL) ===== */
app.get("/test-email", async (req, res) => {
  try {
    await resend.emails.send({
      from: "Teszt <onboarding@resend.dev>",
      to: ["azonositolap@gmail.com"],
      subject: "Resend TESZT",
      text: "Ha ezt megkaptad, a Resend működik."
    });

    res.send("OK – teszt email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

/* ===== PDF FELTÖLTÉS + EMAIL ===== */
app.post("/send-pdf", upload.single("pdf"), async (req, res) => {
  try {
    const { ugyfelEmail } = req.body;

    if (!ugyfelEmail || !req.file) {
      return res.status(400).send("Hiányzó adat");
    }

    await resend.emails.send({
      from: "Azonosító lap <onboarding@resend.dev>",
      to: [ugyfelEmail, "azonositolap@gmail.com"],
      subject: "Azonosító lap",
      text: "Csatolva küldjük az azonosító lapot.",
      attachments: [
        {
          filename: "azonosito_lap.pdf",
          content: req.file.buffer.toString("base64")
        }
      ]
    });

    res.send("Email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Szerver fut:", PORT);
});
