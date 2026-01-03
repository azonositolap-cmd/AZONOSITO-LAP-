const express = require("express");
const { Resend } = require("resend");

const app = express();

// 🔴 NEM IDE ÍRJ API KULCSOT
// 🔴 Render Environment Variable-ből jön
const resend = new Resend(process.env.RESEND_API_KEY);

// === TESZT ROUTE ===
app.get("/test-email", async (req, res) => {
  try {
    const result = await resend.emails.send({
      from: "Azonosító lap <onboarding@resend.dev>",
      to: ["azonisitolap@gmail.com"], // IDE JÖN A TESZT
      subject: "Resend TESZT",
      text: "Ha ezt megkaptad, működik az email küldés."
    });

    res.json({ ok: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// === ROOT (NE LEGYEN NOT FOUND) ===
app.get("/", (req, res) => {
  res.send("Szerver fut. /test-email végponton tesztelj.");
});

// === PORT (RENDER MIATT KÖTELEZŐ) ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
