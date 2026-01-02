const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const { Resend } = require("resend");

const app = express();
const upload = multer();

// 🔴 NEM IDE ÍRJUK AZ API KULCSOT
// Renderen: Environment → RESEND_API_KEY
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ==========================
// FŐOLDAL – HTML
// ==========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ==========================
// TESZT EMAIL (BÖNGÉSZŐBŐL)
// ==========================
app.get("/test-email", async (req, res) => {
  try {
    await resend.emails.send({
      from: "Azonosító lap <no-reply@resend.dev>",
      to: ["azonisitolap@gmail.com"], // ide jön a teszt
      subject: "Resend TESZT",
      text: "Ha ezt megkaptad, az email küldés MŰKÖDIK."
    });

    res.send("✅ Teszt email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Email hiba");
  }
});

// ==========================
// ŰRLAP → EMAIL
// ==========================
app.post("/send-pdf", upload.none(), async (req, res) => {
  try {
    const { ugyfelEmail, gazdaNev = "", cim = "" } = req.body;

    if (!ugyfelEmail) {
      return res.status(400).send("Hiányzó email cím");
    }

    await resend.emails.send({
      from: "Azonosító lap <no-reply@resend.dev>",
      to: [ugyfelEmail, "azonisitolap@gmail.com"],
      subject: "Azonosító lap",
      text: `
Gazda neve: ${gazdaNev}
Cím: ${cim}

Az azonosító lap sikeresen rögzítve.
`
    });

    res.send("✅ Email elküldve");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Szerver hiba");
  }
});

// ==========================
// INDÍTÁS (RENDER KOMPATIBILIS)
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Szerver fut a porton:", PORT);
});
