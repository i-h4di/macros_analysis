"use client";

import { useT } from "@/lib/i18n";

export function TopAppBar() {
  const { t } = useT();
  return (
    <header className="flex justify-between items-center w-full px-margin-mobile h-16 bg-surface-container-low fixed top-0 z-50">
      <div className="flex items-center gap-4">
        <button className="hover:bg-surface-container-highest rounded-full p-2 transition-all active:opacity-70">
          <span className="material-symbols-outlined text-primary">menu</span>
        </button>
        <h1 className="font-display-lg text-headline-lg-mobile text-primary">
          {t("appName")}
        </h1>
      </div>
      <button className="hover:bg-surface-container-highest rounded-full p-2 transition-all active:opacity-70">
        <span className="material-symbols-outlined text-primary">
          notifications
        </span>
      </button>
    </header>
  );
}
