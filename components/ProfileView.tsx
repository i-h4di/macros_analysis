"use client";

import { useCallback, useEffect, useState } from "react";
import type { DayStat } from "@/app/api/stats/weekly/route";
import { getDailyGoal } from "@/lib/goal";
import { WeeklyChart } from "./WeeklyChart";

interface Profile {
  name: string;
  targetWeight: string;
  units: "metric" | "imperial";
  healthKit: boolean;
  reminders: boolean;
  language: "ar" | "en";
}

const PROFILE_KEY = "saarati.profile";

const DEFAULT_PROFILE: Profile = {
  name: "Your Name",
  targetWeight: "75",
  units: "metric",
  healthKit: true,
  reminders: false,
  language: "en",
};

function loadProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function ProfileView() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [goal, setGoal] = useState(2100);
  const [days, setDays] = useState<DayStat[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    setProfile(loadProfile());
    setGoal(getDailyGoal());
    setLoaded(true);
  }, []);

  // Persist whenever the profile changes (after initial load).
  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile, loaded]);

  useEffect(() => {
    fetch("/api/stats/weekly")
      .then((r) => r.json())
      .then((d) => setDays(d.days ?? []))
      .catch(() => setDays([]));
  }, []);

  const update = useCallback(
    <K extends keyof Profile>(key: K, value: Profile[K]) =>
      setProfile((p) => ({ ...p, [key]: value })),
    [],
  );

  const avgKcal =
    days.length > 0
      ? Math.round(days.reduce((s, d) => s + d.calories, 0) / days.length)
      : 0;

  const inputCls =
    "w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all";

  return (
    <div className="mt-stack-gap pb-8 space-y-lg">
      {/* Hero */}
      <section className="flex flex-col items-center pt-base">
        <div className="w-28 h-28 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center border-4 border-surface-container-highest mb-4">
          <span className="font-headline-lg text-[36px]">
            {initials(profile.name)}
          </span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface" dir="auto">
          {profile.name || "Your Name"}
        </h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full font-label-bold text-label-bold">
            Weight Loss
          </span>
          <span className="text-on-surface-variant font-body-sm text-[13px]">
            • Goal {goal} kcal/day
          </span>
        </div>
      </section>

      {/* Weekly caloric intake */}
      <section className="bg-surface-container rounded-xl p-6 border border-outline-variant/40 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Weekly Caloric Intake
            </h3>
            <p className="text-on-surface-variant font-body-sm text-[13px]">
              Last 7 days vs. goal ({goal} kcal)
            </p>
          </div>
          <div className="text-right">
            <span className="text-primary font-display-lg-mobile text-[28px] block leading-none">
              {avgKcal.toLocaleString()}
            </span>
            <span className="text-on-surface-variant font-label-bold text-label-bold">
              AVG KCAL
            </span>
          </div>
        </div>
        {days.length > 0 ? (
          <WeeklyChart days={days} goal={goal} />
        ) : (
          <p className="text-on-surface-variant font-body-md text-[14px] py-8 text-center">
            Log some meals to see your weekly trend.
          </p>
        )}
      </section>

      {/* Personal information */}
      <section className="space-y-4">
        <h3 className="font-headline-sm text-headline-sm text-on-surface px-2">
          Personal Information
        </h3>
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/40 space-y-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-label-bold text-label-bold text-on-surface-variant block">
                Full Name
              </label>
              <input
                className={inputCls}
                type="text"
                dir="auto"
                value={profile.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-bold text-label-bold text-on-surface-variant block">
                Target Weight ({profile.units === "metric" ? "kg" : "lb"})
              </label>
              <input
                className={inputCls}
                type="number"
                value={profile.targetWeight}
                onChange={(e) => update("targetWeight", e.target.value)}
              />
            </div>
          </div>

          {/* Units */}
          <div className="space-y-3">
            <label className="font-label-bold text-label-bold text-on-surface-variant block">
              Unit Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["metric", "Metric (kg/cm)"],
                  ["imperial", "Imperial (lb/in)"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => update("units", val)}
                  className={
                    profile.units === val
                      ? "bg-primary text-on-primary px-6 py-2 rounded-full font-body-sm text-[13px] transition-all active:scale-95"
                      : "bg-surface-container-highest text-on-surface-variant px-6 py-2 rounded-full font-body-sm text-[13px] hover:bg-outline-variant/30 transition-all"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-1 pt-1">
            <ToggleRow
              icon="sync"
              label="Sync with Health Kit"
              on={profile.healthKit}
              onToggle={() => update("healthKit", !profile.healthKit)}
            />
            <ToggleRow
              icon="notifications_active"
              label="Meal Reminders"
              on={profile.reminders}
              onToggle={() => update("reminders", !profile.reminders)}
            />
            {/* Language */}
            <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">
                  language
                </span>
                <span className="font-body-md text-[15px] text-on-surface">
                  Language (اللغة)
                </span>
              </div>
              <div className="flex gap-2">
                {(
                  [
                    ["ar", "العربية"],
                    ["en", "English"],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => update("language", val)}
                    className={
                      profile.language === val
                        ? "bg-primary text-on-primary px-3 py-1 rounded-full font-label-bold text-label-bold"
                        : "bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-full font-label-bold text-label-bold hover:bg-outline-variant/30 transition-all"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sign out (clears local prefs) */}
      <section>
        <button
          onClick={() => {
            if (typeof window === "undefined") return;
            window.localStorage.removeItem(PROFILE_KEY);
            setProfile(DEFAULT_PROFILE);
          }}
          className="w-full flex items-center justify-center gap-2 border border-error text-error font-label-bold text-label-bold py-4 rounded-lg hover:bg-error-container/10 transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">logout</span>
          Reset Profile
        </button>
      </section>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  on,
  onToggle,
}: {
  icon: string;
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary">{icon}</span>
        <span className="font-body-md text-[15px] text-on-surface">{label}</span>
      </div>
      <button
        onClick={onToggle}
        aria-pressed={on}
        className={`w-12 h-6 rounded-full relative transition-colors ${
          on ? "bg-primary" : "bg-surface-container-highest"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
            on ? "right-1 bg-on-primary" : "left-1 bg-surface-variant"
          }`}
        />
      </button>
    </div>
  );
}
