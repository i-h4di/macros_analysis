"use client";

import { useEffect, useRef, useState } from "react";
import type { MealRecord } from "@/lib/types";
import { useT } from "@/lib/i18n";
import type { MealType } from "@/lib/constants";

export interface MealEdit {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface MealCardProps {
  meal: MealRecord;
  onDelete: (id: string) => void;
  onEdit: (id: string, values: MealEdit) => Promise<boolean>;
  deleting: boolean;
}

const TYPE_CHIP: Record<string, string> = {
  breakfast: "bg-primary/20 text-primary",
  lunch: "bg-tertiary-container/20 text-tertiary-fixed-dim",
  dinner: "bg-secondary-container/20 text-secondary",
  snack: "bg-secondary-container/20 text-secondary",
};

export function MealCard({ meal, onDelete, onEdit, deleting }: MealCardProps) {
  const { t, lang } = useT();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [armed, setArmed] = useState(false);
  const disarmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState<MealEdit>({
    name: meal.name,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    fiber: meal.fiber,
  });

  // Auto-disarm the delete confirmation after 3s.
  useEffect(() => {
    if (!armed) return;
    disarmTimer.current = setTimeout(() => setArmed(false), 3000);
    return () => {
      if (disarmTimer.current) clearTimeout(disarmTimer.current);
    };
  }, [armed]);

  const chip = TYPE_CHIP[meal.mealType] ?? "bg-primary/20 text-primary";
  const typeLabel = t(`mealType.${meal.mealType as MealType}`);
  const time = new Date(meal.loggedAt).toLocaleTimeString(
    lang === "ar" ? "ar-SA" : "en-US",
    { hour: "2-digit", minute: "2-digit" },
  );

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!armed) {
      setArmed(true);
      return;
    }
    setArmed(false);
    onDelete(meal.id);
  }

  async function handleSaveEdit() {
    setSavingEdit(true);
    const ok = await onEdit(meal.id, {
      ...form,
      name: form.name.trim() || meal.name,
    });
    setSavingEdit(false);
    if (ok) setEditing(false);
  }

  const numField = (
    key: keyof Omit<MealEdit, "name">,
    label: string,
  ): JSX.Element => (
    <div className="text-center p-2 rounded-lg bg-surface-container-low">
      <p className="text-[10px] font-label-sm text-on-surface-variant">
        {label}
      </p>
      <input
        type="number"
        inputMode="decimal"
        value={form[key]}
        onChange={(e) =>
          setForm((f) => ({ ...f, [key]: Number(e.target.value) || 0 }))
        }
        className="w-full bg-transparent text-center font-headline-lg text-[14px] text-on-surface border-b border-outline-variant focus:border-primary outline-none"
      />
    </div>
  );

  return (
    <div className="bg-surface-container rounded-xl overflow-hidden shadow-lg border border-surface-variant/20">
      <div
        className="p-4 flex items-center gap-4 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="w-12 h-12 rounded-lg flex-shrink-0 bg-surface-container-highest flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">
            restaurant
          </span>
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 ${chip} font-label-sm text-[10px] rounded-full uppercase`}
            >
              {typeLabel}
            </span>
            <span className="text-on-surface-variant font-body-md text-[12px]">
              {time}
            </span>
          </div>
          <h4
            dir="auto"
            className="font-headline-lg text-[16px] text-on-surface truncate"
          >
            {meal.name}
          </h4>
        </div>
        <div className="text-end flex-shrink-0">
          <p className="font-headline-lg text-[16px] text-on-surface">
            {meal.calories.toLocaleString()}
          </p>
          <p className="text-on-surface-variant font-label-sm text-[10px] uppercase">
            {t("card.kcal")}
          </p>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-surface-variant/20">
          {!editing ? (
            <>
              <div className="pt-4 grid grid-cols-4 gap-2 mb-4">
                {(
                  [
                    [t("card.pro"), meal.protein],
                    [t("card.carb"), meal.carbs],
                    [t("card.fat"), meal.fat],
                    [t("card.fiber"), meal.fiber],
                  ] as const
                ).map(([k, v]) => (
                  <div
                    key={k}
                    className="text-center p-2 rounded-lg bg-surface-container-low"
                  >
                    <p className="text-[10px] font-label-sm text-on-surface-variant">
                      {k}
                    </p>
                    <p className="font-headline-lg text-[14px]">
                      {v}
                      {t("common.grams")}
                    </p>
                  </div>
                ))}
              </div>
              {meal.insight && (
                <p
                  dir="auto"
                  className="font-body-md text-[13px] text-on-surface-variant mb-4"
                >
                  {meal.insight}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setForm({
                      name: meal.name,
                      calories: meal.calories,
                      protein: meal.protein,
                      carbs: meal.carbs,
                      fat: meal.fat,
                      fiber: meal.fiber,
                    });
                    setEditing(true);
                  }}
                  className="flex-grow py-3 rounded-lg bg-surface-container-highest text-on-surface font-label-sm text-label-sm hover:bg-primary/20 hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    edit
                  </span>
                  {t("card.edit")}
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={deleting}
                  className={`px-4 py-3 rounded-lg font-label-sm text-label-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                    armed
                      ? "bg-error-container text-on-error-container"
                      : "bg-error-container/20 text-error hover:bg-error-container/40"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                  {deleting
                    ? t("card.removing")
                    : armed
                      ? t("card.confirmDelete")
                      : t("card.delete")}
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
              <input
                dir="auto"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 font-body-md text-on-surface focus:border-primary outline-none transition-all"
              />
              <div className="grid grid-cols-5 gap-2">
                {numField("calories", t("card.calories"))}
                {numField("protein", t("card.pro"))}
                {numField("carbs", t("card.carb"))}
                {numField("fat", t("card.fat"))}
                {numField("fiber", t("card.fiber"))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="flex-grow py-3 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  {t("card.saveEdit")}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  disabled={savingEdit}
                  className="px-4 py-3 rounded-lg bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm"
                >
                  {t("card.cancel")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
