"use client";

import { useEffect, useState, type ComponentType } from "react";
import * as Lucide from "lucide-react";
import { api } from "../lib/api";
import { readableTextOn } from "../lib/utils";
import type { Recommendation } from "../lib/types";
import { Skeleton } from "./Skeletons";

type IconProps = { size?: number | string };

// The backend sends lucide-react component names as strings ("PenTool",
// "Music", …) and grows the list over time — resolve dynamically, with a
// safe fallback for anything unrecognized.
function resolveIcon(name: string): ComponentType<IconProps> {
  const map = Lucide as unknown as Record<string, ComponentType<IconProps>>;
  return map[name] ?? Lucide.Sparkles;
}

export function RecommendationsPanel() {
  const [recs, setRecs] = useState<Recommendation[] | null>(null);

  useEffect(() => {
    api<Recommendation[]>("/recommendations").then(setRecs).catch(() => setRecs([]));
  }, []);

  return (
    <section className="card space-y-3 p-4">
      <h3 className="font-display text-sm font-bold">Find your loop</h3>
      {recs === null && (
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) =>  (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {recs?.map((r) => {
          const Icon = resolveIcon(r.icon);
          return (
            <button
              key={r.id}
              className="btn-press flex h-20 flex-col items-start justify-between rounded-2xl p-3 text-left"
              style={{ backgroundColor: r.color, color: readableTextOn(r.color) }}
            >
              <Icon size={20} />
              <span className="text-xs font-bold">{r.title}</span>
            </button>
          );
        })}
      </div>
      {recs?.length === 0 && <p className="text-xs text-ink-soft">No categories yet.</p>}
    </section>
  );
}
