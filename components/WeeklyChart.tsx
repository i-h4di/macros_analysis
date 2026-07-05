"use client";

import type { DayStat } from "@/app/api/stats/weekly/route";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

interface WeeklyChartProps {
  days: DayStat[];
  goal: number;
}

// Bar chart of the last 7 days' calories, scaled to the goal, today highlighted.
export function WeeklyChart({ days, goal }: WeeklyChartProps) {
  // Scale bars to the larger of the goal or the week's peak so overshoots show.
  const peak = Math.max(goal, ...days.map((d) => d.calories), 1);
  const todayIdx = days.length - 1;

  return (
    <div className="flex items-end justify-between h-40 pt-4 gap-2">
      {days.map((d, i) => {
        const pct = Math.max((d.calories / peak) * 100, 3);
        const isToday = i === todayIdx;
        const over = d.calories > goal;
        const dow = WEEKDAYS[new Date(`${d.date}T00:00:00`).getDay()];
        const fill = over
          ? "bg-error-container/80"
          : isToday
            ? "bg-primary"
            : "bg-primary-container";
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
            <div
              className={`w-full bg-surface-container-low rounded-t-lg relative overflow-hidden ${
                isToday ? "border-2 border-primary" : ""
              }`}
              style={{ height: "100%" }}
              title={`${d.calories} kcal`}
            >
              <div
                className={`absolute bottom-0 w-full ${fill} transition-all duration-500`}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span
              className={`font-label-bold text-label-bold text-[10px] ${
                isToday ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {dow}
            </span>
          </div>
        );
      })}
    </div>
  );
}
