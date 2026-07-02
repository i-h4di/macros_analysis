"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const ITEMS: NavItem[] = [
  { href: "/", label: "Scan", icon: "photo_camera" },
  { href: "/log", label: "Stats", icon: "insights" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-margin-mobile py-4 bg-surface-container-low border-t border-outline-variant/20 z-50">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-6 py-2 transition-transform active:scale-95"
                : "flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            }
          >
            <span
              className={`material-symbols-outlined${active ? " fill-icon" : ""}`}
            >
              {item.icon}
            </span>
            <span className="font-label-sm mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
