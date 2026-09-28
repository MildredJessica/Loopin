import type { GradeLabel } from "./types";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// Every gradient combination the backend can hand out as avatarGradient /
// mediaGradient. Safelisted in tailwind.config.ts.
export const GRADIENTS: string[] = [
  "from-violet to-pink", "from-violet to-mint", "from-violet to-sun", "from-violet to-violet-deep",
  "from-violet-deep to-violet", "from-violet-deep to-pink", "from-violet-deep to-mint", "from-violet-deep to-sun",
  "from-pink to-violet", "from-pink to-violet-deep", "from-pink to-mint", "from-pink to-sun",
  "from-mint to-violet", "from-mint to-violet-deep", "from-mint to-pink", "from-mint to-sun",
  "from-sun to-violet", "from-sun to-violet-deep", "from-sun to-pink", "from-sun to-mint",
];

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function prettyGrade(g: GradeLabel): string {
  return g[0] + g.slice(1).toLowerCase();
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = 60_000, hour = 3_600_000, day = 86_400_000;
  if (diff < min) return "just now";
  if (diff < hour) return rtf.format(-Math.floor(diff / min), "minute");
  if (diff < day) return rtf.format(-Math.floor(diff / hour), "hour");
  return rtf.format(-Math.floor(diff / day), "day");
}

export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

// Pick readable text for a raw-hex tile background based on luminance.
export function readableTextOn(hex: string): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#15121F" : "#FFFFFF";
}
