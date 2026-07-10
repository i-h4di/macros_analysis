"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DailyLogResponse } from "@/lib/types";
import { DAILY_CALORIE_GOAL, DAILY_MACRO_GOALS } from "@/lib/constants";
import { getDailyGoal } from "@/lib/goal";
import { useT } from "@/lib/i18n";
import { CalorieRing } from "./CalorieRing";
import { MacroBar } from "./MacroBar";
import { MealCard, type MealEdit } from "./MealCard";

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

export function DailyLog() {
  const { t, weekdays } = useT();
  const days = useMemo(() => recentDays(7), []);
  const [selected, setSelected] = useState(() => localDateString(new Date()));
  const [data, setData] = useState<DailyLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [goal, setGoal] = useState(DAILY_CALORIE_GOAL);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => setGoal(getDailyGoal()), []);

  // Show the "meal saved" toast if the analyzer flagged it before navigating.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("saarati.toast") === "saved") {
        sessionStorage.removeItem("saarati.toast");
        setToast(t("log.savedToast"));
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function handleEdit(id: string, values: MealEdit): Promise<boolean> {
    try {
      const res = await fetch(`/api/meals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Could not update meal.");
      }
      await load(selected);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }

  const totals = data?.totals;
  const meals = data?.meals ?? [];

  return (
    <div className="mt-stack-gap space-y-section-gap pb-8">
      {/* Success toast */}
      {toast && (
        <div className="fixed top-20 inset-x-0 z-50 flex justify-center px-margin-mobile">
          <div className="bg-primary text-on-primary rounded-full px-6 py-3 font-body-md text-[14px] font-semibold shadow-2xl">
            {toast}
          </div>
        </div>
      )}

      {/* Date strip */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-lg text-headline-lg-mobile">
            {t("log.title")}
          </h2>
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
                  {weekdays[d.getDay()]}
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
                {t("log.dailyEnergy")}
              </p>
              <h3 className="font-display-lg text-[32px] text-on-surface">
                {(totals?.calories ?? 0).toLocaleString()}{" "}
                <span className="text-body-md font-normal text-on-surface-variant">
                  / {goal.toLocaleString()} {t("log.kcal")}
                </span>
              </h3>
            </div>
            <CalorieRing
              value={totals?.calories ?? 0}
              goal={goal}
              size={72}
              stroke={6}
              label={t("common.kcalUnit")}
            />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <MacroBar
              label={t("scan.protein")}
              grams={totals?.protein ?? 0}
              goal={DAILY_MACRO_GOALS.protein}
              color="bg-secondary"
            />
            <MacroBar
              label={t("scan.carbs")}
              grams={totals?.carbs ?? 0}
              goal={DAILY_MACRO_GOALS.carbs}
              color="bg-tertiary-container"
            />
            <MacroBar
              label={t("scan.fats")}
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
          <h2 className="font-headline-lg text-[20px]">
            {t("log.mealsRecorded")}
          </h2>
          <span className="font-label-sm text-label-sm text-primary">
            {meals.length} {meals.length === 1 ? t("log.meal") : t("log.meals")}
          </span>
        </div>

        {error && (
          <div
            dir="auto"
            className="bg-error-container/20 border border-error/30 text-error rounded-lg px-4 py-3 font-body-md text-[14px]"
          >
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-surface-container rounded-xl p-4 flex items-center gap-4 animate-pulse"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-container-highest" />
                <div className="flex-grow space-y-2">
                  <div className="h-3 w-24 rounded-full bg-surface-container-highest" />
                  <div className="h-4 w-40 rounded-full bg-surface-container-highest" />
                </div>
                <div className="h-6 w-12 rounded bg-surface-container-highest" />
              </div>
            ))}
          </div>
        )}

        {!loading && meals.length === 0 && !error && (
          <div className="rounded-xl bg-surface-container-highest p-8 text-center border border-primary/10">
            <span className="material-symbols-outlined text-primary text-[40px]">
              nutrition
            </span>
            <p className="font-headline-lg text-[18px] mt-2">
              {t("log.empty.title")}
            </p>
            <p className="text-on-surface-variant font-body-md text-[14px] mt-1">
              {t("log.empty.subtitle")}
            </p>
          </div>
        )}

        {!loading &&
          meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onDelete={handleDelete}
              onEdit={handleEdit}
              deleting={deletingId === meal.id}
            />
          ))}
      </section>
    </div>
  );
}
