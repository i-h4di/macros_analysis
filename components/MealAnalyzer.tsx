"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MealAnalysis } from "@/lib/types";
import {
  DAILY_CALORIE_GOAL,
  DAILY_MACRO_GOALS,
  MEAL_TYPES,
  MEAL_TYPE_LABELS,
  type MealType,
} from "@/lib/constants";
import { getDailyGoal } from "@/lib/goal";
import { CalorieRing } from "./CalorieRing";
import { MacroBar } from "./MacroBar";

type Phase = "idle" | "analyzing" | "result" | "saving";

export function MealAnalyzer() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [phase, setPhase] = useState<Phase>("idle");
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [goal, setGoal] = useState(DAILY_CALORIE_GOAL);

  useEffect(() => setGoal(getDailyGoal()), []);

  async function handleAnalyze() {
    if (!description.trim() || phase === "analyzing") return;
    setError(null);
    setPhase("analyzing");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, mealType }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed.");
      }
      setAnalysis(data as MealAnalysis);
      setPhase("result");
    } catch (err) {
      setError((err as Error).message);
      setPhase("idle");
    }
  }

  async function handleSave() {
    if (!analysis) return;
    setError(null);
    setPhase("saving");
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...analysis,
          description,
          mealType,
          loggedAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not save meal.");
      }
      router.push("/log");
    } catch (err) {
      setError((err as Error).message);
      setPhase("result");
    }
  }

  function handleClear() {
    setAnalysis(null);
    setDescription("");
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
                Analyze Your Meal
              </h2>
              <p className="font-body-md text-[14px] text-on-surface-variant mt-1">
                Describe what you ate and get instant AI nutrition facts
              </p>
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. grilled chicken shawarma with garlic sauce  •  شاورما دجاج مع ثومية"
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
                {MEAL_TYPE_LABELS[type]}
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
                Estimating nutrition…
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-error-container/20 border border-error/30 text-error rounded-lg px-4 py-3 font-body-md text-[14px]">
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
            {phase === "analyzing" ? "ANALYZING…" : "ANALYZE MEAL"}
          </button>
        )}
      </section>

      {/* Results */}
      {analysis && (phase === "result" || phase === "saving") && (
        <section className="grid grid-cols-2 gap-4">
          {/* Detected items */}
          <div className="col-span-2 bg-surface-container-high rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary">
                restaurant
              </span>
              <h3 className="font-headline-lg text-[18px]">{analysis.mealName}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.items.length === 0 && (
                <span className="text-on-surface-variant font-body-md text-[14px]">
                  No individual items detected.
                </span>
              )}
              {analysis.items.map((item, i) => (
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
          </div>

          {/* Calories */}
          <div className="col-span-1 bg-surface-container-high rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <CalorieRing value={analysis.calories} goal={goal} />
            <p className="font-label-sm mt-4 text-on-surface-variant">
              Daily Total: {Math.round((analysis.calories / goal) * 100)}%
            </p>
          </div>

          {/* Macros */}
          <div className="col-span-1 bg-surface-container-high rounded-xl p-6 space-y-4">
            <h4 className="font-label-sm text-on-surface-variant uppercase tracking-widest">
              Macros
            </h4>
            <MacroBar
              label="Protein"
              grams={analysis.protein}
              goal={DAILY_MACRO_GOALS.protein}
              color="bg-primary"
            />
            <MacroBar
              label="Carbs"
              grams={analysis.carbs}
              goal={DAILY_MACRO_GOALS.carbs}
              color="bg-secondary"
            />
            <MacroBar
              label="Fats"
              grams={analysis.fat}
              goal={DAILY_MACRO_GOALS.fat}
              color="bg-tertiary-container"
            />
          </div>

          {/* AI insight */}
          {analysis.insight && (
            <div className="col-span-2 bg-primary/10 rounded-xl p-6 border border-primary/20">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary fill-icon">
                  auto_awesome
                </span>
                <div>
                  <h4 className="font-label-sm text-primary">AI HEALTH INSIGHT</h4>
                  <p
                    dir="auto"
                    className="font-body-md text-[14px] text-on-surface mt-1"
                  >
                    {analysis.insight}
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
              {phase === "saving" ? "SAVING…" : "SAVE TO DAILY LOG"}
            </button>
            <button
              onClick={handleClear}
              disabled={phase === "saving"}
              className="w-full h-14 bg-transparent text-secondary font-headline-lg text-[16px] rounded-xl border border-outline-variant flex items-center justify-center gap-2 active:opacity-70 transition-opacity"
            >
              ANALYZE ANOTHER
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
