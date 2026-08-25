// App logo, light + dark. 600x600 PNG, solid background, square corners.
//
// The mark is the tagline itself: a thick bar over a thin one — 지갑은 두껍게,
// 뱃살은 얇게. Two shapes only, so it survives down to the ~48px the nav bar
// renders it at, and it carries no illustration style to date it.
const path = require("path");
const { OUT, CACHE, launch, renderHtml } = require("./lib");

const VARIANTS = {
  // Accent ground reads loud in the mini-app grid; ink ground suits dark chrome.
  light: { bg: "#C6F24E", fg: "#0B0C0E" },
  dark: { bg: "#0B0C0E", fg: "#C6F24E" },
};

const html = (v) => `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:600px;height:600px}
  body{display:flex;align-items:center;justify-content:center;background:${v.bg}}
</style></head><body>
  <svg width="600" height="600" viewBox="0 0 100 100" fill="none">
    <rect x="16" y="32" width="68" height="23" rx="11.5" fill="${v.fg}"/>
    <rect x="34" y="63" width="32" height="6"  rx="3"    fill="${v.fg}"/>
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
