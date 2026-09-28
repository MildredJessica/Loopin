"use client";

import { GRADIENTS, cn } from "../lib/utils";

export function GradientPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (g: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {GRADIENTS.map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => onChange(g)}
          aria-label={g}
          className={cn(
            "squircle h-9 w-full bg-gradient-to-br transition-transform hover:scale-105",
            g,
            value === g && "scale-105 ring-2 ring-violet ring-offset-2 ring-offset-card"
          )}
        />
      ))}
    </div>
  );
}
