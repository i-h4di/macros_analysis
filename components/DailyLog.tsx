"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DailyLogResponse } from "@/lib/types";
import { DAILY_CALORIE_GOAL, DAILY_MACRO_GOALS } from "@/lib/constants";
import { CalorieRing } from "./CalorieRing";
import { MacroBar } from "./MacroBar";
import { MealCard } from "./MealCard";

function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Build a window of the last `count` days ending today (oldest first).
function recentDays(count: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function DailyLog() {
  const days = useMemo(() => recentDays(7), []);
  const [selected, setSelected] = useState(() => localDateString(new Date()));
  const [data, setData] = useState<DailyLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/meals?date=${date}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not load meals.");
      setData(json as DailyLogResponse);
    } catch (err) {
      setError((err as Error).message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(selected);
  }, [selected, load]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/meals/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Could not delete meal.");
      }
      await load(selected);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  const totals = data?.totals;
  const meals = data?.meals ?? [];

  return (
    <div className="mt-stack-gap space-y-section-gap pb-8">
      {/* Date strip */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-lg text-headline-lg-mobile">Your Log</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {days.map((d) => {
            const ds = localDateString(d);
            const active = ds === selected;
            return (
              <button
                key={ds}
                onClick={() => setSelected(ds)}
                className={
                  active
                    ? "flex flex-col items-center justify-center min-w-[56px] h-20 rounded-xl bg-primary text-on-primary ring-4 ring-primary/20"
                    : "flex flex-col items-center justify-center min-w-[56px] h-20 rounded-xl bg-surface-container-low text-on-surface-variant"
                }
              >
                <span className="font-label-sm text-[10px] uppercase opacity-70">
                  {WEEKDAYS[d.getDay()]}
                </span>
                <span className="font-headline-lg text-[20px]">
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Summary card */}
      <section>
        <div className="bg-surface-container rounded-xl p-6 shadow-xl border border-surface-variant/30">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase tracking-widest">
                Daily Energy
              </p>
              <h3 className="font-display-lg text-[32px] text-on-surface">
                {totals?.calories ?? 0}{" "}
                <span className="text-body-md font-normal text-on-surface-variant">
                  / {DAILY_CALORIE_GOAL} kcal
                </span>
              </h3>
            </div>
            <CalorieRing
              value={totals?.calories ?? 0}
              goal={DAILY_CALORIE_GOAL}
              size={72}
              stroke={6}
              label="Kcal"
            />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <MacroBar
              label="Protein"
              grams={totals?.protein ?? 0}
              goal={DAILY_MACRO_GOALS.protein}
              color="bg-secondary"
            />
            <MacroBar
              label="Carbs"
              grams={totals?.carbs ?? 0}
              goal={DAILY_MACRO_GOALS.carbs}
              color="bg-tertiary-container"
            />
            <MacroBar
              label="Fats"
              grams={totals?.fat ?? 0}
              goal={DAILY_MACRO_GOALS.fat}
              color="bg-error"
            />
          </div>
        </div>
      </section>

      {/* Meal list */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-headline-lg text-[20px]">Meals Recorded</h2>
          <span className="font-label-sm text-label-sm text-primary">
            {meals.length} {meals.length === 1 ? "MEAL" : "MEALS"}
          </span>
        </div>

        {error && (
          <div className="bg-error-container/20 border border-error/30 text-error rounded-lg px-4 py-3 font-body-md text-[14px]">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-10 text-on-surface-variant font-body-md">
            Loading…
          </div>
        )}

        {!loading && meals.length === 0 && !error && (
          <div className="rounded-xl bg-surface-container-highest p-8 text-center border border-primary/10">
            <span className="material-symbols-outlined text-primary text-[40px]">
              nutrition
            </span>
            <p className="font-headline-lg text-[18px] mt-2">No meals yet</p>
            <p className="text-on-surface-variant font-body-md text-[14px] mt-1">
              Head to Scan to describe and log a meal.
            </p>
          </div>
        )}

        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onDelete={handleDelete}
            deleting={deletingId === meal.id}
          />
        ))}
      </section>
    </div>
  );
}
