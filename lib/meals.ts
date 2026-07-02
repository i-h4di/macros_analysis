import type { Meal } from "@prisma/client";
import type { DailyTotals, MealRecord } from "@/lib/types";

export function serializeMeal(meal: Meal): MealRecord {
  return {
    id: meal.id,
    name: meal.name,
    description: meal.description,
    mealType: meal.mealType,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    fiber: meal.fiber,
    insight: meal.insight,
    loggedAt: meal.loggedAt.toISOString(),
    createdAt: meal.createdAt.toISOString(),
  };
}

export function computeTotals(meals: MealRecord[]): DailyTotals {
  return meals.reduce<DailyTotals>(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: round1(acc.protein + m.protein),
      carbs: round1(acc.carbs + m.carbs),
      fat: round1(acc.fat + m.fat),
      fiber: round1(acc.fiber + m.fiber),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

// Returns the [start, end) instants that bound a calendar day given as
// YYYY-MM-DD, interpreted in the server's local timezone.
export function dayRange(date: string): { start: Date; end: Date } {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
