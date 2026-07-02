"use client";

import { useState } from "react";
import type { MealRecord } from "@/lib/types";
import { MEAL_TYPE_LABELS, type MealType } from "@/lib/constants";

interface MealCardProps {
  meal: MealRecord;
  onDelete: (id: string) => void;
  deleting: boolean;
}

const TYPE_CHIP: Record<string, string> = {
  breakfast: "bg-primary/20 text-primary",
  lunch: "bg-tertiary-container/20 text-tertiary-fixed-dim",
  dinner: "bg-secondary-container/20 text-secondary",
  snack: "bg-secondary-container/20 text-secondary",
};

export function MealCard({ meal, onDelete, deleting }: MealCardProps) {
  const [open, setOpen] = useState(false);
  const chip = TYPE_CHIP[meal.mealType] ?? "bg-primary/20 text-primary";
  const label = MEAL_TYPE_LABELS[meal.mealType as MealType] ?? meal.mealType;
  const time = new Date(meal.loggedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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
              {label}
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
        <div className="text-right flex-shrink-0">
          <p className="font-headline-lg text-[16px] text-on-surface">
            {meal.calories}
          </p>
          <p className="text-on-surface-variant font-label-sm text-[10px]">
            KCAL
          </p>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-surface-variant/20">
          <div className="pt-4 grid grid-cols-4 gap-2 mb-4">
            {[
              ["PRO", meal.protein],
              ["CARB", meal.carbs],
              ["FAT", meal.fat],
              ["FIBER", meal.fiber],
            ].map(([k, v]) => (
              <div
                key={k as string}
                className="text-center p-2 rounded-lg bg-surface-container-low"
              >
                <p className="text-[10px] font-label-sm text-on-surface-variant">
                  {k}
                </p>
                <p className="font-headline-lg text-[14px]">{v}g</p>
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(meal.id);
            }}
            disabled={deleting}
            className="w-full py-3 rounded-lg bg-error-container/20 text-error font-label-sm text-label-sm hover:bg-error-container/40 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            {deleting ? "REMOVING…" : "DELETE ENTRY"}
          </button>
        </div>
      )}
    </div>
  );
}
