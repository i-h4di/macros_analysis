// Daily nutrition goals. In this MVP these are fixed constants; per-user goals
// arrive with the Profile screen later.
export const DAILY_CALORIE_GOAL = 2100;

// Target grams used to draw the macro progress bars on the daily summary.
export const DAILY_MACRO_GOALS = {
  protein: 140,
  carbs: 240,
  fat: 70,
} as const;

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};
