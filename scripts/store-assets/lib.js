const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "../..");
const DIST = path.join(ROOT, "dist");
const OUT = path.join(ROOT, "store-assets");
const CACHE = path.join(ROOT, ".store-assets-cache");
const SCREENS = path.join(CACHE, "screens");
const PORT = Number(process.env.STORE_ASSET_PORT || 8099);
const BASE = `http://localhost:${PORT}`;

// Playwright lives outside the project in some environments (e.g. a global install),
// so allow both the normal resolution and an explicit override.
function loadChromium() {
  const candidates = [
    process.env.PLAYWRIGHT_PATH,
    "playwright",
    "/opt/node22/lib/node_modules/playwright",
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      return require(c).chromium;
    } catch {
      /* try next */
    }
  }
  throw new Error("playwright not found — set PLAYWRIGHT_PATH");
}

async function launch() {
  const chromium = loadChromium();
  const executablePath =
    process.env.CHROMIUM_PATH ||
    (fs.existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
      ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
      : undefined);
  return chromium.launch({
    executablePath,
    args: ["--no-sandbox", "--font-render-hinting=none"],
  });
}

// Renders an HTML string at an exact pixel size and writes a PNG.
async function renderHtml(page, html, outFile, tmpName) {
  fs.mkdirSync(CACHE, { recursive: true });
  const f = path.join(CACHE, tmpName);
  fs.writeFileSync(f, html);
  await page.goto("file://" + f, { waitUntil: "networkidle" });
  await page.waitForTimeout(350);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  await page.screenshot({ path: outFile });
  console.log("wrote", path.relative(ROOT, outFile));
}

const b64 = (p) => fs.readFileSync(p).toString("base64");

module.exports = { ROOT, DIST, OUT, CACHE, SCREENS, PORT, BASE, launch, renderHtml, b64 };
