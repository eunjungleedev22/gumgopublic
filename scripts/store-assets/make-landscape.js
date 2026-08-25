// Landscape store screenshot, 1504x741. Same editorial language as the portrait
// set: ink ground, tight oversized headline, and the three screens that carry the
// story — dashboard, the mechanic, the payoff.
const path = require("path");
const { OUT, SCREENS, CACHE, launch, renderHtml, b64 } = require("./lib");

const W = 1504;
const H = 741;
const PHONE_W = 254;

const INK = "#0B0C0E";
const GROUND = "#191C21";
const LIME = "#C6F24E";

const shot = (n) => b64(path.join(SCREENS, `${n}.png`));

const phones = [
  { img: shot("home"), x: 660, y: 108 },
  { img: shot("hypnosis"), x: 934, y: 62 },
  { img: shot("result"), x: 1208, y: 108 },
];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px;overflow:hidden}
  body{background:${GROUND};font-family:'Noto Sans CJK KR','Noto Sans',sans-serif;
       -webkit-font-smoothing:antialiased;position:relative}
  .left{position:absolute;left:88px;top:150px;width:560px}
  .brand{display:flex;align-items:center;gap:16px;margin-bottom:38px}
  .brand img{width:64px;height:64px;border-radius:16px}
  .brand span{color:#F2F3F5;font-size:26px;font-weight:800;letter-spacing:-.8px}
  h1{color:#F2F3F5;font-size:64px;font-weight:900;line-height:1.22;letter-spacing:-2.6px}
  h1 em{font-style:normal;color:${LIME}}
  p{color:#8A9099;font-size:22px;font-weight:600;line-height:1.55;margin-top:28px;letter-spacing:-.5px}
  .phone{position:absolute;width:${PHONE_W}px;border-radius:24px;line-height:0;
         overflow:hidden;background:${INK};box-shadow:inset 0 0 0 1px rgba(255,255,255,.10)}
  .phone img{width:${PHONE_W}px;display:block}
</style></head><body>
  <div class="left">
    <div class="brand">
      <img src="data:image/png;base64,${b64(path.join(CACHE, "logo-dark.png"))}"><span>통장통통</span>
    </div>
    <h1>지갑은 <em>두껍게</em>,<br>뱃살은 얇게</h1>
    <p>먹고 싶은 음식을 기록하면 먹은 셈 치고,<br>아낀 돈과 피한 칼로리를 대신 계산해 드려요.</p>
  </div>
  ${phones
    .map(
      (p) => `<div class="phone" style="left:${p.x}px;top:${p.y}px">
      <img src="data:image/png;base64,${p.img}">
    </div>`
    )
    .join("")}
</body></html>`;

(async () => {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await renderHtml(page, html, path.join(OUT, "screenshot-landscape-1.png"), "landscape.html");
  await browser.close();
})().catch((e) => {
  console.error("FAILED", e.message);
  process.exit(1);
});
