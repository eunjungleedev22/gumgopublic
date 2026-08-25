// Portrait store screenshots, 636x1048.
//
// Editorial treatment: ink ground, oversized tight-tracked Korean headline with
// the key word in the accent colour, and the real screen sitting flush and
// cropped by the frame — no pastel ground, no floating drop-shadowed mockup.
const path = require("path");
const { OUT, SCREENS, launch, renderHtml, b64 } = require("./lib");

const W = 636;
const H = 1048;
const PHONE_TOP = 300;
const PHONE_W = 470;

const INK = "#0B0C0E";      // app background, used for the phone body
const GROUND = "#191C21";   // slide ground — one step lighter so the screen separates
const LIME = "#C6F24E";
const BONE = "#F2F1EC";

const slides = [
  {
    n: 1, shot: "home",
    bg: GROUND, fg: "#F2F3F5", kicker: LIME, hairline: "rgba(255,255,255,.10)",
    kickerText: "01 — 절약",
    title: '참을 때마다<br><em>통장이</em> 두꺼워져요',
  },
  {
    n: 2, shot: "log",
    bg: GROUND, fg: "#F2F3F5", kicker: LIME, hairline: "rgba(255,255,255,.10)",
    kickerText: "02 — 기록",
    title: '음식·양·가격만<br>넣으면 <em>자동 계산</em>',
  },
  {
    // inverted to break the rhythm, and the dark app screen lands hard on lime
    n: 3, shot: "hypnosis",
    bg: LIME, fg: INK, kicker: "rgba(11,12,14,.55)", hairline: "rgba(0,0,0,.14)",
    kickerText: "03 — 참기",
    title: '먹는 상상으로<br>식욕을 흘려보내요',
    offset: 200,
  },
  {
    n: 4, shot: "result",
    bg: GROUND, fg: "#F2F3F5", kicker: LIME, hairline: "rgba(255,255,255,.10)",
    kickerText: "04 — 보상",
    title: '안 먹은 만큼<br><em>바로 쌓여요</em>',
  },
  {
    n: 5, shot: "history",
    bg: BONE, fg: INK, kicker: "rgba(11,12,14,.5)", hairline: "rgba(0,0,0,.12)",
    kickerText: "05 — 습관",
    title: '일별·주간 통계로<br>흐름을 봐요',
  },
];

const html = (s) => `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px;overflow:hidden}
  body{background:${s.bg};font-family:'Noto Sans CJK KR','Noto Sans',sans-serif;
       -webkit-font-smoothing:antialiased}
  .head{padding:58px 44px 0}
  .kicker{color:${s.kicker};font-size:15px;font-weight:800;letter-spacing:.6px;
          margin-bottom:20px}
  h1{color:${s.fg};font-size:49px;font-weight:900;line-height:1.26;letter-spacing:-2.2px}
  h1 em{font-style:normal;color:${s.bg === LIME ? INK : LIME}}
  .phone{position:absolute;top:${PHONE_TOP}px;left:${(W - PHONE_W) / 2}px;
    width:${PHONE_W}px;height:${H - PHONE_TOP + 40}px;
    border-radius:26px;overflow:hidden;background:${INK};
    box-shadow:inset 0 0 0 1px ${s.hairline}}
  .phone img{width:${PHONE_W}px;display:block;margin-top:-${s.offset || 0}px}
</style></head><body>
  <div class="head">
    <div class="kicker">${s.kickerText}</div>
    <h1>${s.title}</h1>
  </div>
  <div class="phone">
    <img src="data:image/png;base64,${b64(path.join(SCREENS, s.shot + ".png"))}">
  </div>
</body></html>`;

(async () => {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (const s of slides) {
    await renderHtml(page, html(s), path.join(OUT, `screenshot-portrait-${s.n}.png`), `portrait-${s.n}.html`);
  }
  await browser.close();
})().catch((e) => {
  console.error("FAILED", e.message);
  process.exit(1);
});
