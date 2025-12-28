# AZONOSITO-LAP-
Azonosító lap kitöltő és email küldő rendszer
[index.html](https://github.com/user-attachments/files/24362342/index.html)
<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<title>Azonosító lap</title>
<meta name="viewport" content="width=device-width, initial-scale=1">

<style>
* { box-sizing: border-box; }

body {
  font-family: Arial, sans-serif;
  background: #f5f5f5;
  padding: 20px;
}

.container {
  background: #fff;
  max-width: 900px;
  margin: auto;
  padding: 30px;
  border: 1px solid #ccc;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}

.top-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  font-weight: bold;
}

label {
  font-weight: bold;
  display: block;
  margin-top: 18px;
}

input, select, textarea, canvas {
  width: 100%;
  margin-top: 6px;
}

input, select, textarea {
  padding: 10px;
  font-size: 15px;
}

textarea {
  min-height: 90px;
  resize: vertical;
}

.row {
  display: flex;
  gap: 20px;
}

.row > div {
  flex: 1;
}

canvas {
  border: 1px solid #000;
  height: 150px;
  touch-action: none;
  background: #fff;
}

.checkbox {
  margin-top: 18px;
}

.checkbox label {
  font-weight: normal;
}

.checkbox input {
  transform: scale(1.2);
}

.signature-block {
  margin-top: 20px;
}

.pecset {
  width: 260px;
  opacity: 0.9;
}

button {
  margin-top: 20px;
  padding: 14px;
  width: 100%;
  font-size: 16px;
  cursor: pointer;
}
</style>

<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
</head>

<body>
<div class="container" id="doc">

<h2>Azonosító lap</h2>

<div class="top-info">
  <div>Dátum: <span id="datum"></span></div>
  <div>Érkeztetési szám: <span id="erkszam"></span></div>
</div>

<label>Megbízó neve</label>
<input type="text" id="gazdaNev">

<label>Cím</label>
<input id="cim" type="text">

<label>Telefonszám</label>
<input type="tel">

<label>Megbízott</label>
<input type="text" value="Budai Tamás e.v. | Adószám: 69528279143 | Nyilvántartási szám: 53314194" readonly>

<label>Állat adatai</label>
<select id="allatFajta">
  <option value="">Válasszon</option>
  <option>Kutya</option>
  <option>Macska</option>
  <option>Egyéb</option>
</select>

<div id="egyebAllat" style="display:none;">
  <label>Milyen állat?</label>
  <input type="text">
</div>

<div class="row">
  <div>
    <label>Név</label>
    <input type="text">
  </div>
  <div>
    <label>Chip szám</label>
    <input type="text">
  </div>
</div>

<div class="row">
  <div>
    <label>Állat neme</label>
    <select>
      <option>Hím</option>
      <option>Nőstény</option>
      <option>Ismeretlen</option>
    </select>
  </div>
  <div>
    <label>Súly (kg)</label>
    <input type="number">
  </div>
</div>

<label>
Az állat testében található-e bármilyen implantátum  
(pl. chipen kívüli fém, orvosi eszköz)?
</label>
<div class="checkbox"><label>Igen</label><input type="checkbox" class="implant"></div>
<div class="checkbox"><label>Nem</label><input type="checkbox" class="implant"></div>

<label>Milyen urna?</label>
<input type="text">

<label>Urna állapota</label>
<select>
  <option>Ragasztva</option>
  <option>Nem ragasztva</option>
</select>

<label>Fizetés módja</label>
<div class="checkbox"><label>Készpénz</label><input type="checkbox"></div>
<div class="checkbox"><label>Átutalás (egy összegben)</label><input type="checkbox"></div>

<label>Elszállításnál fizetett összeg (Ft)</label>
<input type="number">

<label>Visszaszállításnál fizetendő összeg (Ft)</label>
<input type="number">

<div class="checkbox">
  <label>
    Tisztelt Gazdi! A kisállattal együtt átvett pokróc, nyakörv stb. megsemmisítésre kerül.
  </label>
  <input type="checkbox">
</div>

<div class="checkbox">
  <label>Hozzájárulok személyes adataim kezeléséhez</label>
  <input type="checkbox" required>
</div>

<label>Hol találta hirdetésünket?</label>
<input type="text">

<label>Megjegyzés</label>
<textarea></textarea>

<label>Megbízó aláírása</label>
<canvas id="signUser"></canvas>

<label>Megbízott</label>
<div class="signature-block">
  <img src="assets/pecset.PNG" class="pecset">
</div>

<label>Ügyfél email címe</label>
<input type="email" id="ugyfelEmail" required>

<button id="pdfBtn">PDF készítés és küldés</button>

</div>

<script>
// DÁTUM + ÉRKEZTETÉS
const d = new Date();
const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
datum.innerText = ds.replaceAll("-", ".");
let c = localStorage.getItem("erk") || 0;
localStorage.setItem("erk", ++c);
const es = String(c).padStart(4,"0");
erkszam.innerText = `${ds}-${es}`;

// EGYÉB ÁLLAT
allatFajta.onchange = e =>
  egyebAllat.style.display = e.target.value==="Egyéb" ? "block" : "none";

// IMPLANTÁTUM kizárás
document.querySelectorAll(".implant").forEach(cb=>{
  cb.onchange = ()=>document.querySelectorAll(".implant").forEach(o=>{
    if(o!==cb) o.checked=false;
  });
});

// ALÁÍRÁS
const canvas = document.getElementById("signUser");
const ctx = canvas.getContext("2d");
canvas.width = canvas.offsetWidth;
canvas.height = 150;
let draw=false;

function pos(e){
  const r=canvas.getBoundingClientRect();
  return e.touches
    ? {x:e.touches[0].clientX-r.left,y:e.touches[0].clientY-r.top}
    : {x:e.clientX-r.left,y:e.clientY-r.top};
}

["mousedown","touchstart"].forEach(ev=>canvas.addEventListener(ev,e=>{
  e.preventDefault(); draw=true;
  const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y);
}));
["mousemove","touchmove"].forEach(ev=>canvas.addEventListener(ev,e=>{
  if(!draw)return; e.preventDefault();
  const p=pos(e); ctx.lineWidth=2; ctx.lineCap="round";
  ctx.lineTo(p.x,p.y); ctx.stroke();
}));
["mouseup","touchend","mouseleave"].forEach(ev=>canvas.addEventListener(ev,()=>{
  draw=false; ctx.beginPath();
}));

// FÁJLNÉV TISZTÍTÁS
function cleanFileName(str){
  return str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-zA-Z0-9]+/g,"_")
    .replace(/^_|_$/g,"");
}

// PDF + EMAIL  (⬅️ CSAK ITT VAN JAVÍTÁS)
pdfBtn.onclick = async () => {
  if(!ugyfelEmail.value){
    alert("Add meg az email címet!");
    return;
  }

  const cimText = document.getElementById("cim").value || "cim_nelkul";
  const fileName = `azonosito_lap_${ds}_${cleanFileName(cimText)}.pdf`;

  const element = document.getElementById("doc");

  const pdfBlob = await html2pdf()
    .from(element)
    .set({
      margin: 10,
      html2canvas: {
        scale: window.innerWidth < 768 ? 0.65 : 0.85, // ← MOBIL JAVÍTÁS
        scrollY: 0,
        useCORS: true
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait"
      },
      pagebreak: {
        mode: ["avoid-all","css","legacy"]
      }
    })
    .outputPdf("blob");

  const fd = new FormData();
  fd.append("pdf", pdfBlob, fileName);
  fd.append("ugyfelEmail", ugyfelEmail.value);
  fd.append("gazdaNev", document.getElementById("gazdaNev").value);
  fd.append("cim", document.getElementById("cim").value);

  await fetch("/send-pdf", {
    method: "POST",
    body: fd
  });

  alert("PDF elkészült és elküldve!");
};
</script>

</body>
</html>
