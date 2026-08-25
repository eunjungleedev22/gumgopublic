// App icons under assets/images/, generated from the same mark as the logo.
//
// Two things matter here beyond size:
//  - the Android adaptive foreground/monochrome layers must be transparent,
//    otherwise they paint over the background layer and the mask looks solid;
//  - those layers get a smaller mark, because adaptive icons crop to roughly the
//    centre 60% and anything wider than that gets clipped on round masks.
const path = require("path");
const fs = require("fs");
const { ROOT, CACHE, launch } = require("./lib");

const RED = "#A8352A";
const BUTTER = "#FBE7BF";
const CREAM = "#F7F4EC";

const MARK = (fg) =>
  `<rect x="16" y="32" width="68" height="23" rx="11.5" fill="${fg}"/>` +
  `<rect x="34" y="63" width="32" height="6"  rx="3"    fill="${fg}"/>`;

// wider viewBox => smaller mark inside the same canvas
const page = (size, bg, fg, viewBox = "0 0 100 100") => `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0}
  html,body{width:${size}px;height:${size}px}
  body{display:flex;align-items:center;justify-content:center;${bg ? `background:${bg}` : ""}}
</style></head><body>
  <svg width="${size}" height="${size}" viewBox="${viewBox}">${fg ? MARK(fg) : ""}</svg>
</body></html>`;

const jobs = [
  { file: "icon.png", size: 1024, bg: BUTTER, fg: RED },
  { file: "splash-icon.png", size: 1024, bg: CREAM, fg: RED },
  { file: "favicon.png", size: 256, bg: BUTTER, fg: RED },
  { file: "android-icon-background.png", size: 1024, bg: BUTTER, fg: null },
  { file: "android-icon-foreground.png", size: 1024, bg: null, fg: RED, viewBox: "-25 -25 150 150", alpha: true },
  { file: "android-icon-monochrome.png", size: 1024, bg: null, fg: RED, viewBox: "-25 -25 150 150", alpha: true },
];

(async () => {
  const browser = await launch();
  fs.mkdirSync(CACHE, { recursive: true });
  for (const j of jobs) {
    const p = await browser.newPage({ viewport: { width: j.size, height: j.size }, deviceScaleFactor: 1 });
    const tmp = path.join(CACHE, `appicon-${j.file}.html`);
    fs.writeFileSync(tmp, page(j.size, j.bg, j.fg, j.viewBox));
    await p.goto("file://" + tmp, { waitUntil: "networkidle" });
    const out = path.join(ROOT, "assets/images", j.file);
    await p.screenshot({ path: out, omitBackground: !!j.alpha });
    console.log("wrote", path.relative(ROOT, out), j.alpha ? "(transparent)" : "");
    await p.close();
  }
  await browser.close();
})().catch((e) => {
  console.error("FAILED", e.message);
  process.exit(1);
});
