import { z } from "zod";

// Structured result the LLM must return for a described meal.
export const MealAnalysisSchema = z.object({
  mealName: z.string().min(1),
  items: z.array(z.string()).default([]),
  calories: z.number().int().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  fiber: z.number().nonnegative(),
  insight: z.string().default(""),
});

export type MealAnalysis = z.infer<typeof MealAnalysisSchema>;

// A meal persisted in the database, serialized for the client.
export interface MealRecord {
  id: string;
  name: string;
  description: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  insight: string | null;
  loggedAt: string;
  createdAt: string;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface DailyLogResponse {
  date: string;
  meals: MealRecord[];
  totals: DailyTotals;
}
