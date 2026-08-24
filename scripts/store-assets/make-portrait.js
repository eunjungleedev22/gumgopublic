// Portrait store screenshots, 636x1048. One per step of the core flow.
// Each slide is a headline over the real captured screen, which bleeds off the
// bottom edge so the frame reads as a phone rather than a cropped image.
const path = require("path");
const { OUT, SCREENS, launch, renderHtml, b64 } = require("./lib");

const W = 636;
const H = 1048;
const PHONE_TOP = 288;
const PHONE_W = 428;

const slides = [
  {
    n: 1, shot: "home",
    bg: "#FF5A5F", fg: "#FFFFFF", sub: "rgba(255,255,255,.82)",
    title: "참을 때마다<br>통장이 두꺼워져요",
    subtitle: "아낀 돈과 피한 칼로리가 한눈에",
  },
  {
    n: 2, shot: "log",
    bg: "#FFF1EC", fg: "#1A1A1A", sub: "rgba(26,26,26,.62)",
    title: "음식·양·가격만 입력하면<br>칼로리까지 자동 계산",
    subtitle: "한국 배달·간식 음식 DB 내장",
  },
  {
    // light background so the app's dark hypnosis screen stands out as a device
    n: 3, shot: "hypnosis",
    bg: "#ECEAF7", fg: "#221B3D", sub: "rgba(34,27,61,.62)",
    title: "먹는 상상으로<br>식욕을 흘려보내요",
    subtitle: "냄새 → 한 입 → 씹기 → 삼킴 → 포만감",
    offset: 100, phoneBg: "#191F28",
  },
  {
    n: 4, shot: "result",
    bg: "#EAFBF0", fg: "#14532D", sub: "rgba(20,83,45,.66)",
    title: "안 먹은 만큼<br>바로 쌓이는 절약액",
    subtitle: "탄수화물·단백질·지방까지 함께 기록",
  },
  {
    n: 5, shot: "history",
    bg: "#F2F4F6", fg: "#1A1A1A", sub: "rgba(26,26,26,.62)",
    title: "일별·주간 통계로<br>절약 습관 만들기",
    subtitle: "이번 주에 얼마나 잘 참았는지 확인",
  },
];

const html = (s) => `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px;overflow:hidden}
  body{background:${s.bg};font-family:'Noto Sans CJK KR','Noto Sans',sans-serif;
       -webkit-font-smoothing:antialiased}
  .head{padding:60px 48px 0}
  h1{color:${s.fg};font-size:44px;font-weight:900;line-height:1.30;letter-spacing:-1.2px}
  p{color:${s.sub};font-size:21px;font-weight:600;margin-top:18px;letter-spacing:-.4px}
  .phone{position:absolute;top:${PHONE_TOP}px;left:${(W - PHONE_W) / 2}px;
    width:${PHONE_W}px;height:${H - PHONE_TOP + 60}px;
    border-radius:30px;overflow:hidden;background:${s.phoneBg || "#fff"};
    box-shadow:0 22px 60px rgba(0,0,0,.22)}
  .phone img{width:${PHONE_W}px;display:block;margin-top:-${s.offset || 0}px}
</style></head><body>
  <div class="head"><h1>${s.title}</h1><p>${s.subtitle}</p></div>
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
