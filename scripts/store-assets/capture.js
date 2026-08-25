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

// Anchor to calendar days rather than "N hours ago" — a plain hours-ago offset
// slides into the previous day when the capture runs just after midnight, which
// silently zeroes out the "오늘" stats on the home screen.
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);
const T0 = startOfToday.getTime();

// `daysAgo: 0` is clamped into today even when it is barely past midnight.
const at = (daysAgo, hour) =>
  daysAgo === 0 ? Math.min(T0 + hour * HOUR, now - 60 * 1000) : T0 - daysAgo * DAY + hour * HOUR;

const seed = [
  { foodName: "후라이드치킨", servings: 1,   price: 22000, calories: 800, carbs: 40,  protein: 60, fat: 45, emoji: "🍗",  daysAgo: 0, hour: 20 },
  { foodName: "버블티",       servings: 1,   price: 5500,  calories: 350, carbs: 70,  protein: 3,  fat: 5,  emoji: "🧋",  daysAgo: 0, hour: 15 },
  { foodName: "떡볶이",       servings: 1.5, price: 12000, calories: 720, carbs: 135, protein: 14, fat: 12, emoji: "🌶️", daysAgo: 1, hour: 21 },
  { foodName: "마라탕",       servings: 1,   price: 14000, calories: 700, carbs: 50,  protein: 30, fat: 40, emoji: "🌶️", daysAgo: 1, hour: 13 },
  { foodName: "피자",         servings: 2,   price: 18000, calories: 570, carbs: 72,  protein: 24, fat: 20, emoji: "🍕",  daysAgo: 2, hour: 19 },
  { foodName: "아이스크림",   servings: 1,   price: 4500,  calories: 250, carbs: 30,  protein: 4,  fat: 12, emoji: "🍦",  daysAgo: 2, hour: 14 },
  { foodName: "족발",         servings: 1,   price: 32000, calories: 800, carbs: 10,  protein: 60, fat: 55, emoji: "🍖",  daysAgo: 4, hour: 20 },
  { foodName: "곱창",         servings: 1,   price: 25000, calories: 600, carbs: 5,   protein: 30, fat: 50, emoji: "🍢",  daysAgo: 5, hour: 22 },
]
  .map(({ daysAgo, hour, ...e }, i) => {
    const createdAt = at(daysAgo, hour);
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

  await shot("home", "/", "text=오늘 뭐 먹고 싶어요?");

  await shot("log", "/log", "text=참을 음식", async (page) => {
    // two text inputs on this screen: food name, then price
    await page.locator("input").nth(0).fill("후라이드치킨");
    await page.locator("input").nth(1).fill("22000");
    // drop focus so the browser's focus ring doesn't sit over the field in the shot
    await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));
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
