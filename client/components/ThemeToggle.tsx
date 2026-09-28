"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "../lib/theme";

const NEXT: Record<ThemeMode, ThemeMode> = {
  light: "dark",
  dark: "system",
  system: "light",
};

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;
  return (
    <button
      onClick={() => setMode(NEXT[mode])}
      className="btn-press flex items-center gap-2 self-start rounded-full border border-line bg-card px-3 py-2 text-xs font-semibold capitalize text-ink-soft hover:text-ink"
      title={`Theme: ${mode}`}
    >
      <Icon size={15} />
      {mode}
    </button>
  );
}
