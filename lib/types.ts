export type NutritionInfo = {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
};

export type FoodDbEntry = NutritionInfo & {
  emoji: string;
  aliases: string[];
};

export type MatchQuality = "exact" | "category" | "fallback";

export type NutritionEstimate = NutritionInfo & {
  matchQuality: MatchQuality;
  matchedName: string;
  emoji: string;
};

export type CravingEntry = {
  id: string;
  createdAt: number;
  foodName: string;
  servings: number;
  price: number;
} & NutritionEstimate;
