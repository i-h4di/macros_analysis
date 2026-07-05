"use client";

import { DAILY_CALORIE_GOAL } from "@/lib/constants";

const GOAL_KEY = "saarati.dailyGoal";

// Read the user's daily calorie goal from localStorage, falling back to the
// app default. Safe to call on the client only.
export function getDailyGoal(): number {
  if (typeof window === "undefined") return DAILY_CALORIE_GOAL;
  const raw = window.localStorage.getItem(GOAL_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.round(n) : DAILY_CALORIE_GOAL;
}

export function setDailyGoal(goal: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GOAL_KEY, String(Math.round(goal)));
  // Let other components in the same tab react immediately.
  window.dispatchEvent(new Event("saarati:goal"));
}
