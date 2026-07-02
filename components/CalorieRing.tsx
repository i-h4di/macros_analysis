interface CalorieRingProps {
  value: number;
  goal: number;
  size?: number;
  stroke?: number;
  label?: string;
}

// SVG progress ring showing calories consumed against a goal.
export function CalorieRing({
  value,
  goal,
  size = 112,
  stroke = 8,
  label = "Kcal",
}: CalorieRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = goal > 0 ? Math.min(value / goal, 1) : 0;
  const offset = circumference * (1 - pct);
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full">
        <circle
          className="text-surface-container-highest"
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
        />
        <circle
          className="text-primary progress-ring-circle"
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={stroke}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-headline-lg text-[24px]">
          {Math.round(value)}
        </span>
        <span className="font-label-sm text-on-surface-variant uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}
