import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeTotals, dayRange, serializeMeal } from "@/lib/meals";

export const runtime = "nodejs";
// Reads the DB per request; never prerender at build time.
export const dynamic = "force-dynamic";

export interface DayStat {
  date: string; // YYYY-MM-DD
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// GET /api/stats/weekly -> per-day totals for the last 7 days (oldest first).
export async function GET() {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(localDate(d));
  }

  // Query the whole 7-day window once, then bucket by day.
  const start = dayRange(days[0]).start;
  const end = dayRange(days[days.length - 1]).end;
  const rows = await prisma.meal.findMany({
    where: { loggedAt: { gte: start, lt: end } },
    orderBy: { loggedAt: "asc" },
  });
  const meals = rows.map(serializeMeal);

  const stats: DayStat[] = days.map((date) => {
    const { start: s, end: e } = dayRange(date);
    const dayMeals = meals.filter((m) => {
      const t = new Date(m.loggedAt);
      return t >= s && t < e;
    });
    const totals = computeTotals(dayMeals);
    return {
      date,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
    };
  });

  return NextResponse.json({ days: stats });
}

function localDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
