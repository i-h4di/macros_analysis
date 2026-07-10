"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MealAnalysis } from "@/lib/types";
import {
  DAILY_CALORIE_GOAL,
  DAILY_MACRO_GOALS,
  MEAL_TYPES,
  type MealType,
} from "@/lib/constants";
import { getDailyGoal } from "@/lib/goal";
import { useT } from "@/lib/i18n";
import { CalorieRing } from "./CalorieRing";
import { MacroBar } from "./MacroBar";

type Phase = "idle" | "analyzing" | "result" | "saving";

const PORTIONS = [0.5, 1, 1.5, 2] as const;

function scale(a: MealAnalysis, factor: number): MealAnalysis {
  return {
    ...a,
    calories: Math.round(a.calories * factor),
    protein: Math.round(a.protein * factor * 10) / 10,
    carbs: Math.round(a.carbs * factor * 10) / 10,
    fat: Math.round(a.fat * factor * 10) / 10,
    fiber: Math.round(a.fiber * factor * 10) / 10,
  };
}

export function MealAnalyzer() {
  const router = useRouter();
  const { t, lang } = useT();
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [phase, setPhase] = useState<Phase>("idle");
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [portion, setPortion] = useState<number>(1);
  const [mealName, setMealName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [goal, setGoal] = useState(DAILY_CALORIE_GOAL);

  useEffect(() => setGoal(getDailyGoal()), []);

  const scaled = analysis ? scale(analysis, portion) : null;

  async function handleAnalyze() {
    if (!description.trim() || phase === "analyzing") return;
    setError(null);
    setPhase("analyzing");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, mealType, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? t("scan.errorGeneric"));
      }
      const a = data as MealAnalysis;
      setAnalysis(a);
      setMealName(a.mealName);
      setPortion(1);
      setPhase("result");
    } catch (err) {
      setError((err as Error).message || t("scan.errorGeneric"));
      setPhase("idle");
    }
  }

  async function handleSave() {
    if (!scaled) return;
    setError(null);
    setPhase("saving");
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...scaled,
          mealName: mealName.trim() || scaled.mealName,
          description,
          mealType,
          loggedAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? t("scan.errorGeneric"));
      }
      // Flag for the log page to show a success toast after navigation.
      try {
        sessionStorage.setItem("saarati.toast", "saved");
      } catch {}
      router.push("/log");
    } catch (err) {
      setError((err as Error).message || t("scan.errorGeneric"));
      setPhase("result");
    }
  }

  function handleClear() {
    setAnalysis(null);
    setDescription("");
    setMealName("");
    setPortion(1);
    setError(null);
    setPhase("idle");
  }

  return (
    <div className="mt-stack-gap space-y-section-gap">
      {/* Describe / analyze input */}
      <section className="space-y-md">
        <div className="relative w-full bg-surface-container rounded-xl overflow-hidden border-2 border-dashed border-outline-variant focus-within:border-primary transition-all p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-lg">
              <span className="material-symbols-outlined text-[40px] fill-icon">
                restaurant
              </span>
            </div>
            <div className="px-2">
              <h2 className="font-headline-lg text-[20px] text-on-surface">
                {t("scan.title")}
              </h2>
              <p className="font-body-md text-[14px] text-on-surface-variant mt-1">
                {t("scan.subtitle")}
              </p>
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("scan.placeholder")}
            rows={3}
            dir="auto"
            disabled={phase === "analyzing"}
            className="mt-6 w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />

          {/* Meal type chips */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {MEAL_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                disabled={phase === "analyzing"}
                className={
                  mealType === type
                    ? "px-4 py-1.5 rounded-full font-body-md text-[13px] bg-primary text-on-primary transition-all active:scale-95"
                    : "px-4 py-1.5 rounded-full font-body-md text-[13px] bg-surface-container-highest text-on-surface-variant hover:bg-outline-variant/30 transition-all"
                }
              >
                {t(`mealType.${type}`)}
              </button>
            ))}
          </div>

          {/* Scanning overlay */}
          {phase === "analyzing" && (
            <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_#f6c453] animate-scan" />
              </div>
              <p className="font-label-sm text-primary animate-pulse uppercase relative z-10">
                {t("scan.scanning")}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div
            dir="auto"
            className="bg-error-container/20 border border-error/30 text-error rounded-lg px-4 py-3 font-body-md text-[14px]"
          >
            {error}
          </div>
        )}

        {(phase === "idle" || phase === "analyzing") && (
          <button
            onClick={handleAnalyze}
            disabled={!description.trim() || phase === "analyzing"}
            className="w-full h-14 bg-primary text-on-primary font-headline-lg text-[16px] rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100"
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            {phase === "analyzing" ? t("scan.analyzing") : t("scan.analyze")}
          </button>
        )}
      </section>

      {/* Results */}
      {scaled && (phase === "result" || phase === "saving") && (
        <section className="grid grid-cols-2 gap-4">
          {/* Meal name + detected items */}
          <div className="col-span-2 bg-surface-container-high rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary">
                restaurant
              </span>
              <label className="sr-only">{t("scan.mealName")}</label>
              <input
                dir="auto"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="flex-grow bg-transparent font-headline-lg text-[18px] text-on-surface border-b border-transparent focus:border-primary outline-none transition-colors min-w-0"
              />
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                edit
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {scaled.items.length === 0 && (
                <span className="text-on-surface-variant font-body-md text-[14px]">
                  {t("scan.noItems")}
                </span>
              )}
              {scaled.items.map((item, i) => (
                <span
                  key={i}
                  dir="auto"
                  className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full font-body-md text-[14px] flex items-center gap-2"
                >
                  {item}
                  <span className="material-symbols-outlined text-[16px]">
                    check_circle
                  </span>
                </span>
              ))}
            </div>

            {/* Portion multiplier */}
            <div className="mt-5">
              <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-2">
                {t("scan.portion")}
              </p>
              <div className="flex gap-2">
                {PORTIONS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPortion(p)}
                    disabled={phase === "saving"}
                    className={
                      portion === p
                        ? "flex-1 py-2 rounded-full bg-primary text-on-primary font-body-md text-[14px] font-semibold transition-all active:scale-95"
                        : "flex-1 py-2 rounded-full bg-surface-container-highest text-on-surface-variant font-body-md text-[14px] hover:bg-outline-variant/30 transition-all"
                    }
                  >
                    ×{p === 0.5 ? "½" : p === 1.5 ? "1½" : p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calories */}
          <div className="col-span-1 bg-surface-container-high rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <CalorieRing
              value={scaled.calories}
              goal={goal}
              label={t("common.kcalUnit")}
            />
            <p className="font-label-sm mt-4 text-on-surface-variant">
              {Math.round((scaled.calories / goal) * 100)}% {t("scan.dailyTotal")}
            </p>
          </div>

          {/* Macros */}
          <div className="col-span-1 bg-surface-container-high rounded-xl p-6 space-y-4">
            <h4 className="font-label-sm text-on-surface-variant uppercase tracking-widest">
              {t("scan.macros")}
            </h4>
            <MacroBar
              label={t("scan.protein")}
              grams={scaled.protein}
              goal={DAILY_MACRO_GOALS.protein}
              color="bg-primary"
            />
            <MacroBar
              label={t("scan.carbs")}
              grams={scaled.carbs}
              goal={DAILY_MACRO_GOALS.carbs}
              color="bg-secondary"
            />
            <MacroBar
              label={t("scan.fats")}
              grams={scaled.fat}
              goal={DAILY_MACRO_GOALS.fat}
              color="bg-tertiary-container"
            />
          </div>

          {/* AI insight */}
          {scaled.insight && (
            <div className="col-span-2 bg-primary/10 rounded-xl p-6 border border-primary/20">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary fill-icon">
                  auto_awesome
                </span>
                <div>
                  <h4 className="font-label-sm text-primary uppercase">
                    {t("scan.insight")}
                  </h4>
                  <p
                    dir="auto"
                    className="font-body-md text-[14px] text-on-surface mt-1"
                  >
                    {scaled.insight}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="col-span-2 mt-4 space-y-3">
            <button
              onClick={handleSave}
              disabled={phase === "saving"}
              className="w-full h-14 bg-primary text-on-primary font-headline-lg text-[16px] rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              <span className="material-symbols-outlined">save</span>
              {phase === "saving" ? t("scan.saving") : t("scan.save")}
            </button>
            <button
              onClick={handleClear}
              disabled={phase === "saving"}
              className="w-full h-14 bg-transparent text-secondary font-headline-lg text-[16px] rounded-xl border border-outline-variant flex items-center justify-center gap-2 active:opacity-70 transition-opacity"
            >
              {t("scan.another")}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
