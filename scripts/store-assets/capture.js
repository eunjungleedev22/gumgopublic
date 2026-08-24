// Captures the five real app screens used in the store screenshots.
// Requires `server.js` to be running against a fresh `dist/` export.
//
// Storage is seeded directly so the screens show a believable history instead of
// empty states. Every nutrition value below matches what lib/estimate.ts would
// compute for that food and serving size, so the totals on screen add up.
const path = require("path");
const fs = require("fs");
const { SCREENS, BASE, launch } = require("./lib");

const KEY = "meogeuncheok:entries:v1";
const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const now = Date.now();

const seed = [
  { foodName: "후라이드치킨", servings: 1,   price: 22000, calories: 800, carbs: 40,  protein: 60, fat: 45, emoji: "🍗",  ago: 3 * HOUR },
  { foodName: "버블티",       servings: 1,   price: 5500,  calories: 350, carbs: 70,  protein: 3,  fat: 5,  emoji: "🧋",  ago: 6 * HOUR },
  { foodName: "떡볶이",       servings: 1.5, price: 12000, calories: 720, carbs: 135, protein: 14, fat: 12, emoji: "🌶️", ago: DAY + 2 * HOUR },
  { foodName: "마라탕",       servings: 1,   price: 14000, calories: 700, carbs: 50,  protein: 30, fat: 40, emoji: "🌶️", ago: DAY + 8 * HOUR },
  { foodName: "피자",         servings: 2,   price: 18000, calories: 570, carbs: 72,  protein: 24, fat: 20, emoji: "🍕",  ago: 2 * DAY + 4 * HOUR },
  { foodName: "아이스크림",   servings: 1,   price: 4500,  calories: 250, carbs: 30,  protein: 4,  fat: 12, emoji: "🍦",  ago: 2 * DAY + 9 * HOUR },
  { foodName: "족발",         servings: 1,   price: 32000, calories: 800, carbs: 10,  protein: 60, fat: 55, emoji: "🍖",  ago: 4 * DAY + 5 * HOUR },
  { foodName: "곱창",         servings: 1,   price: 25000, calories: 600, carbs: 5,   protein: 30, fat: 50, emoji: "🍢",  ago: 5 * DAY + 7 * HOUR },
]
  .map(({ ago, ...e }, i) => {
    const createdAt = now - ago;
    return { ...e, matchQuality: "exact", matchedName: e.foodName, id: `seed-${i}-${createdAt}`, createdAt };
  })
  .sort((a, b) => b.createdAt - a.createdAt); // newest first, same as the app

(async () => {
  fs.mkdirSync(SCREENS, { recursive: true });
  const browser = await launch();

  async function shot(name, route, waitFor, extra) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    await ctx.addInitScript(
      ([k, v]) => {
        try {
          localStorage.setItem(k, v);
        } catch {}
      },
      [KEY, JSON.stringify(seed)]
    );
    const page = await ctx.newPage();
    await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(waitFor, { timeout: 25000 });
    if (extra) await extra(page);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENS, `${name}.png`) });
    console.log("captured", name);
    await ctx.close();
  }

  await shot("home", "/", "text=누적 절약 금액");

  await shot("log", "/log", "text=참을 음식을 기록해요", async (page) => {
    await page.fill('input[placeholder*="후라이드치킨"]', "후라이드치킨");
    await page.fill('input[placeholder*="18000"]', "22000");
    await page.waitForTimeout(400);
  });

  // caught mid-sequence so the step text and progress dots are both visible
  const params = new URLSearchParams({ foodName: "후라이드치킨", servings: "1", price: "22000" });
  await shot("hypnosis", `/hypnosis?${params}`, "text=후라이드치킨", (page) => page.waitForTimeout(2400));

  await shot("result", `/result?id=${encodeURIComponent(seed[0].id)}`, "text=참아냈어요");
  await shot("history", "/history", "text=최근 7일");

  await browser.close();
})().catch((e) => {
  console.error("FAILED", e.message);
  process.exit(1);
});
