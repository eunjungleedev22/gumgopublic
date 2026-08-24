// Landscape store screenshot, 1504x741. Brand block on the left, the three
// screens that carry the story on the right: dashboard, the mechanic, the payoff.
const path = require("path");
const { OUT, SCREENS, CACHE, launch, renderHtml, b64 } = require("./lib");

const W = 1504;
const H = 741;
const PHONE_W = 254;

const shot = (n) => b64(path.join(SCREENS, `${n}.png`));

const phones = [
  { img: shot("home"), x: 660, y: 108 },
  { img: shot("hypnosis"), x: 934, y: 62, offset: 100, bg: "#191F28" },
  { img: shot("result"), x: 1208, y: 108 },
];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px;overflow:hidden}
  body{background:#FF5A5F;font-family:'Noto Sans CJK KR','Noto Sans',sans-serif;
       -webkit-font-smoothing:antialiased;position:relative}
  .glow{position:absolute;width:900px;height:900px;border-radius:50%;top:-260px;right:-140px;
        background:radial-gradient(circle,rgba(255,255,255,.13) 0%,rgba(255,255,255,0) 70%)}
  .left{position:absolute;left:88px;top:148px;width:540px}
  .brand{display:flex;align-items:center;gap:18px;margin-bottom:34px}
  .brand img{width:74px;height:74px;border-radius:20px}
  .brand span{color:#fff;font-size:29px;font-weight:800;letter-spacing:-.8px}
  h1{color:#fff;font-size:62px;font-weight:900;line-height:1.24;letter-spacing:-2px}
  p{color:rgba(255,255,255,.86);font-size:23px;font-weight:600;line-height:1.55;
    margin-top:26px;letter-spacing:-.5px}
  .phone{position:absolute;width:${PHONE_W}px;height:${H}px;border-radius:26px;
         overflow:hidden;box-shadow:0 26px 64px rgba(0,0,0,.30)}
  .phone img{width:${PHONE_W}px;display:block}
</style></head><body>
  <div class="glow"></div>
  <div class="left">
    <div class="brand">
      <img src="data:image/png;base64,${b64(path.join(CACHE, "logo-light.png"))}"><span>통장통통</span>
    </div>
    <h1>지갑은 두껍게,<br>뱃살은 얇게</h1>
    <p>먹고 싶은 음식을 기록하면 먹은 셈 치고,<br>아낀 돈과 피한 칼로리를 대신 계산해 드려요.</p>
  </div>
  ${phones
    .map(
      (p) => `<div class="phone" style="left:${p.x}px;top:${p.y}px;background:${p.bg || "#fff"}">
      <img src="data:image/png;base64,${p.img}" style="margin-top:-${p.offset || 0}px">
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
