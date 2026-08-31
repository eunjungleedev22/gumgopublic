import { FALLBACK_NUTRITION, FOOD_CATEGORIES, FOOD_DB } from "./foodDb";
import { NutritionEstimate } from "./types";

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, "");
}

function findExactMatch(query: string): { name: string; entry: (typeof FOOD_DB)[string] } | null {
  const q = normalize(query);
  if (!q) return null;

  for (const [name, entry] of Object.entries(FOOD_DB)) {
    const candidates = [name, ...entry.aliases].map(normalize);
    if (candidates.some((c) => c === q || q.includes(c) || c.includes(q))) {
      return { name, entry };
    }
  }
  return null;
}

function findCategoryMatch(query: string) {
  const q = normalize(query);
  if (!q) return null;

  for (const category of FOOD_CATEGORIES) {
    if (category.keywords.some((keyword) => q.includes(normalize(keyword)))) {
      return category;
    }
  }
  return null;
}

// 음식 이름과 인분 수를 받아 대략적인 칼로리/탄단지를 추정한다.
export function estimateNutrition(foodName: string, servings: number): NutritionEstimate {
  const multiplier = Number.isFinite(servings) && servings > 0 ? servings : 1;

  const exact = findExactMatch(foodName);
  if (exact) {
    return {
      calories: Math.round(exact.entry.calories * multiplier),
      carbs: Math.round(exact.entry.carbs * multiplier),
      protein: Math.round(exact.entry.protein * multiplier),
      fat: Math.round(exact.entry.fat * multiplier),
      matchQuality: "exact",
      matchedName: exact.name,
      emoji: exact.entry.emoji,
    };
  }

  const category = findCategoryMatch(foodName);
  if (category) {
    return {
      calories: Math.round(category.calories * multiplier),
      carbs: Math.round(category.carbs * multiplier),
      protein: Math.round(category.protein * multiplier),
      fat: Math.round(category.fat * multiplier),
      matchQuality: "category",
      matchedName: category.name,
      emoji: category.emoji,
    };
  }

  return {
    calories: Math.round(FALLBACK_NUTRITION.calories * multiplier),
    carbs: Math.round(FALLBACK_NUTRITION.carbs * multiplier),
    protein: Math.round(FALLBACK_NUTRITION.protein * multiplier),
    fat: Math.round(FALLBACK_NUTRITION.fat * multiplier),
    matchQuality: "fallback",
    matchedName: "평균 추정치",
    emoji: FALLBACK_NUTRITION.emoji,
  };
}

// 사용자가 입력하는 동안 자동완성 후보를 보여주기 위한 목록
export function suggestFoodNames(query: string, limit = 6): string[] {
  const q = normalize(query);
  const names = Object.keys(FOOD_DB);
  if (!q) return names.slice(0, limit);

  // An exact match is already in the field and echoed by the estimate card, so
  // offering it a third time as a chip is just noise.
  return names
    .filter((name) => normalize(name) !== q)
    .filter((name) => normalize(name).includes(q) || FOOD_DB[name].aliases.some((a) => normalize(a).includes(q)))
    .slice(0, limit);
}
