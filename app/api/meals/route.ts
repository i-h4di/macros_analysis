import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MealAnalysisSchema, type DailyLogResponse } from "@/lib/types";
import { MEAL_TYPES, type MealType } from "@/lib/constants";
import {
  computeTotals,
  dayRange,
  isValidDate,
  serializeMeal,
} from "@/lib/meals";
import { z } from "zod";

export const runtime = "nodejs";

// GET /api/meals?date=YYYY-MM-DD -> meals + daily totals for that day.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? localToday();

  if (!isValidDate(date)) {
    return NextResponse.json(
      { error: "Invalid date. Use YYYY-MM-DD." },
      { status: 400 },
    );
  }

  const { start, end } = dayRange(date);
  const rows = await prisma.meal.findMany({
    where: { loggedAt: { gte: start, lt: end } },
    orderBy: { loggedAt: "asc" },
  });

  const meals = rows.map(serializeMeal);
  const body: DailyLogResponse = {
    date,
    meals,
    totals: computeTotals(meals),
  };
  return NextResponse.json(body);
}

const CreateMealSchema = MealAnalysisSchema.extend({
  description: z.string().min(1),
  mealType: z.enum(MEAL_TYPES),
  loggedAt: z.string().datetime().optional(),
});

// POST /api/meals -> persist an analyzed meal.
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = CreateMealSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid meal data.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const meal = await prisma.meal.create({
    data: {
      name: data.mealName,
      description: data.description,
      mealType: data.mealType as MealType,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber,
      insight: data.insight || null,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
    },
  });

  return NextResponse.json(serializeMeal(meal), { status: 201 });
}

function localToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
