interface MacroBarProps {
  label: string;
  grams: number;
  goal: number;
  color: string; // tailwind bg-* class for the fill
}

// A labelled macro progress bar (Protein / Carbs / Fat).
export function MacroBar({ label, grams, goal, color }: MacroBarProps) {
  const pct = goal > 0 ? Math.min((grams / goal) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-end">
        <span className="font-body-md text-[14px] font-semibold">{label}</span>
        <span className="font-body-md text-[14px] text-on-surface-variant">
          {grams}g
        </span>
      </div>
      <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
