// App logo, light + dark. 600x600 PNG, solid background, square corners.
// Mark: a piggy bank with a coin — reads as "saving" instantly and holds its
// silhouette down to ~48px, which is the size Toss renders it at in the nav bar.
const path = require("path");
const { OUT, CACHE, launch, renderHtml } = require("./lib");

const VARIANTS = {
  light: { bg: "#FF5A5F", body: "#FFFFFF", shade: "#FFD9DA", ink: "#FF5A5F", coin: "#FFC94D", coinInk: "#B0740A" },
  dark: { bg: "#14171C", body: "#FF6B70", shade: "#C7454A", ink: "#14171C", coin: "#FFC94D", coinInk: "#7A4E05" },
};

const html = (v) => `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:600px;height:600px}
  body{display:flex;align-items:center;justify-content:center;background:${v.bg}}
</style></head><body>
  <svg width="600" height="600" viewBox="-11 -10 122 122" fill="none">
    <circle cx="50" cy="16" r="11" fill="${v.coin}"/>
    <text x="50" y="16" font-family="'Noto Sans CJK KR','Noto Sans',sans-serif"
          font-size="13" font-weight="900" fill="${v.coinInk}"
          text-anchor="middle" dominant-baseline="central">&#8361;</text>
    <rect x="26" y="76" width="12" height="14" rx="4" fill="${v.shade}"/>
    <rect x="62" y="76" width="12" height="14" rx="4" fill="${v.shade}"/>
    <rect x="38" y="78" width="12" height="14" rx="4" fill="${v.body}"/>
    <rect x="50" y="78" width="12" height="14" rx="4" fill="${v.body}"/>
    <path d="M62 34 L78 28 L74 46 Z" fill="${v.shade}"/>
    <ellipse cx="48" cy="58" rx="34" ry="26" fill="${v.body}"/>
    <ellipse cx="82" cy="60" rx="12" ry="10" fill="${v.shade}"/>
    <circle cx="79" cy="60" r="2.1" fill="${v.ink}"/>
    <circle cx="86" cy="60" r="2.1" fill="${v.ink}"/>
    <circle cx="64" cy="50" r="3.4" fill="${v.ink}"/>
    <rect x="34" y="33" width="26" height="6" rx="3" fill="${v.ink}"/>
    <path d="M15 54 q-9 -3 -7 -10 q2 -6 8 -3"
          stroke="${v.body}" stroke-width="5" stroke-linecap="round" fill="none"/>
  </svg>
</body></html>`;

(async () => {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 600, height: 600 }, deviceScaleFactor: 1 });
  for (const [name, v] of Object.entries(VARIANTS)) {
    await renderHtml(page, html(v), path.join(OUT, `logo-${name}-600.png`), `logo-${name}.html`);
    // keep a copy for the landscape slide to embed
    await page.screenshot({ path: path.join(CACHE, `logo-${name}.png`) });
  }
  await browser.close();
})().catch((e) => {
  console.error("FAILED", e.message);
  process.exit(1);
});
