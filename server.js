const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const { Resend } = require("resend");

const app = express();
const upload = multer();

// 🔴 EZ KÖTELEZŐ – ENV-BŐL JÖN
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ✅ FŐOLDAL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ TESZT EMAIL (BÖNGÉSZŐBE!)
app.get("/test-email", async (req, res) => {
  try {
    await resend.emails.send({
      from: "Teszt <no-reply@resend.dev>",
      to: ["azonositolap@gmail.com"],
      subject: "TESZT – Resend működik",
      text: "Ha ezt megkaptad, az email küldés OK."
    });

    res.send("✅ Teszt email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// ✅ ŰRLAP → EMAIL
app.post("/send-pdf", upload.none(), async (req, res) => {
  const { ugyfelEmail } = req.body;

  if (!ugyfelEmail) {
    return res.status(400).send("Hiányzó email");
  }

  try {
    await resend.emails.send({
      from: "Azonosító lap <no-reply@resend.dev>",
      to: [ugyfelEmail, "azonisitolap@gmail.com"],
      subject: "Azonosító lap",
      text: "Az űrlap sikeresen elküldve."
    });

    res.send("✅ Email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Szerver fut porton:", PORT);
});
