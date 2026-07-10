"use client";

import { useState } from "react";
import { setDailyGoal } from "@/lib/goal";
import { useT, type TKey } from "@/lib/i18n";
import { CalorieRing } from "./CalorieRing";
import { MacroBar } from "./MacroBar";

type Gender = "male" | "female";

interface Result {
  bmr: number;
  tdee: number;
  protein: number;
  carbs: number;
  fat: number;
}

const ACTIVITY: { value: number; labelKey: TKey }[] = [
  { value: 1.2, labelKey: "calc.activity.sedentary" },
  { value: 1.375, labelKey: "calc.activity.light" },
  { value: 1.55, labelKey: "calc.activity.moderate" },
  { value: 1.725, labelKey: "calc.activity.active" },
  { value: 1.9, labelKey: "calc.activity.veryActive" },
];

// Mifflin–St Jeor + a 30/40/30 (protein/carbs/fat) calorie split.
function calculate(
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  activity: number,
): Result {
  const base = 10 * weight + 6.25 * height - 5 * age;
  const bmr = gender === "male" ? base + 5 : base - 161;
  const tdee = bmr * activity;
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    protein: Math.round((tdee * 0.3) / 4),
    carbs: Math.round((tdee * 0.4) / 4),
    fat: Math.round((tdee * 0.3) / 9),
  };
}

export function VitalityCalculator() {
  const { t } = useT();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [activity, setActivity] = useState(1.55);
  const [result, setResult] = useState<Result | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCalculate() {
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);
    if (!(w > 0) || !(h > 0) || !(a > 0)) {
      setError(t("calc.error"));
      setResult(null);
      return;
    }
    setError(null);
    setSaved(false);
    setResult(calculate(w, h, a, gender, activity));
  }

  function handleSetGoal() {
    if (!result) return;
    setDailyGoal(result.tdee);
    setSaved(true);
  }

  const inputCls =
    "w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all";

  return (
    <div className="mt-stack-gap pb-8 space-y-section-gap">
      {/* Hero intro */}
      <section>
        <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-2">
          {t("calc.title")}
        </h2>
        <p className="text-on-surface-variant font-body-md text-[14px] max-w-xl">
          {t("calc.subtitle")}
        </p>
      </section>

      {/* Dimensions */}
      <section className="bg-surface-container p-6 rounded-xl shadow-lg border border-outline-variant">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary">
            monitor_weight
          </span>
          <h3 className="font-headline-lg text-[18px] text-on-surface">
            {t("calc.dimensions")}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
              {t("calc.weight")}
            </label>
            <input
              className={inputCls}
              type="number"
              inputMode="decimal"
              placeholder="e.g. 75"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
              {t("calc.height")}
            </label>
            <input
              className={inputCls}
              type="number"
              inputMode="decimal"
              placeholder="e.g. 180"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Profile */}
      <section className="bg-surface-container p-6 rounded-xl shadow-lg border border-outline-variant">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary">person</span>
          <h3 className="font-headline-lg text-[18px] text-on-surface">
            {t("calc.profile")}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
              {t("calc.age")}
            </label>
            <input
              className={inputCls}
              type="number"
              inputMode="numeric"
              placeholder="e.g. 28"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
              {t("calc.gender")}
            </label>
            <div className="flex gap-2">
              {(["male", "female"] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={
                    gender === g
                      ? "flex-1 py-2.5 rounded-lg border border-primary bg-primary text-on-primary capitalize transition-all"
                      : "flex-1 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant capitalize transition-all"
                  }
                >
                  {t(g === "male" ? "calc.male" : "calc.female")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Activity */}
      <section className="bg-surface-container p-6 rounded-xl shadow-lg border border-outline-variant">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary">
            directions_run
          </span>
          <h3 className="font-headline-lg text-[18px] text-on-surface">
            {t("calc.activity")}
          </h3>
        </div>
        <div className="relative">
          <select
            className={`${inputCls} appearance-none pe-10`}
            value={activity}
            onChange={(e) => setActivity(Number(e.target.value))}
          >
            {ACTIVITY.map((a) => (
              <option key={a.value} value={a.value}>
                {t(a.labelKey)}
              </option>
            ))}
          </select>
          <div className="absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="material-symbols-outlined text-on-surface-variant">
              expand_more
            </span>
          </div>
        </div>
      </section>

      {error && (
        <div className="bg-error-container/20 border border-error/30 text-error rounded-lg px-4 py-3 font-body-md text-[14px]">
          {error}
        </div>
      )}

      <button
        onClick={handleCalculate}
        className="w-full h-14 bg-primary text-on-primary font-headline-lg text-[16px] rounded-xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined">bolt</span>
        {t("calc.calculate")}
      </button>

      {/* Results */}
      {result && (
        <section className="space-y-4">
          <div className="bg-surface-container-high rounded-xl p-6 flex flex-col items-center text-center border border-primary/10">
            <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-4">
              {t("calc.target")}
            </p>
            <CalorieRing
              value={result.tdee}
              goal={result.tdee}
              label={t("common.kcalUnit")}
            />
            <p className="font-body-md text-[13px] text-on-surface-variant mt-4">
              {t("calc.maintenance")} {result.bmr.toLocaleString()}
            </p>
          </div>

          <div className="bg-surface-container-high rounded-xl p-6 space-y-4">
            <h4 className="font-label-sm text-on-surface-variant uppercase tracking-widest">
              {t("calc.suggestedMacros")}
            </h4>
            <MacroBar
              label={t("scan.protein")}
              grams={result.protein}
              goal={result.protein}
              color="bg-primary"
            />
            <MacroBar
              label={t("scan.carbs")}
              grams={result.carbs}
              goal={result.carbs}
              color="bg-secondary"
            />
            <MacroBar
              label={t("scan.fats")}
              grams={result.fat}
              goal={result.fat}
              color="bg-tertiary-container"
            />
          </div>

          <button
            onClick={handleSetGoal}
            disabled={saved}
            className="w-full h-14 bg-primary-container text-on-primary-container font-headline-lg text-[16px] rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span className="material-symbols-outlined">
              {saved ? "check_circle" : "flag"}
            </span>
            {saved ? t("calc.savedGoal") : t("calc.setGoal")}
          </button>
        </section>
      )}
    </div>
  );
}
