"use client";

import { useState, type ReactNode } from "react";
import { Shuffle, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import { cn } from "../lib/utils";
import {
  RECIPE_OPTIONS,
  clearRecipe,
  randomRecipe,
  saveRecipe,
  type AvatarRecipe,
} from "../lib/avatarRecipe";

const LABELS: Record<string, string> = {
  round: "Round",
  square: "Soft square",
  heart: "Heart",
  dots: "Dots",
  happy: "Happy",
  stars: "Stars",
  hearts: "Hearts",
  smile: "Smile",
  grin: "Grin",
  smirk: "Smirk",
  o: "Ooh",
  none: "None",
  glasses: "Glasses",
  headphones: "Headphones",
  fringe: "Fringe",
  curly: "Curly",
  bun: "Bun",
};

function OptionRow({
  title,
  options,
  value,
  onChange,
  render,
}: {
  title: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  render?: (v: string) => ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-soft">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={cn(
              "btn-press rounded-full border px-3 py-1.5 text-xs font-semibold",
              value === o
                ? "border-violet bg-violet-soft text-violet"
                : "border-line bg-base-2 text-ink-soft hover:border-violet"
            )}
          >
            {render ? render(o) : (LABELS[o] ?? o)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AvatarBuilderModal({
  open,
  onClose,
  gradient,
}: {
  open: boolean;
  onClose: () => void;
  gradient: string;
}) {
  const [recipe, setRecipe] = useState<AvatarRecipe>(randomRecipe());
  const choose = (patch: Partial<AvatarRecipe>) => setRecipe((r) => ({ ...r, ...patch }));

  return (
    <Modal open={open} onClose={onClose} title="Build your avatar" wide>
      <div className="space-y-4">
        <div className="flex justify-center rounded-2xl bg-base-2 p-4">
          <Avatar gradient={gradient} name="you" size={110} recipe={recipe} />
        </div>
        <p className="rounded-2xl bg-sun-soft p-3 text-[11px] font-medium leading-relaxed">
          Beta: your custom face is saved on this device only (full profile sync
          coming soon). The gradient behind it syncs everywhere.
        </p>

        <div className="space-y-3">
          <OptionRow title="Face" options={RECIPE_OPTIONS.FACES} value={recipe.face} onChange={(v) => choose({ face: v })} />
          <OptionRow title="Eyes" options={RECIPE_OPTIONS.EYES} value={recipe.eyes} onChange={(v) => choose({ eyes: v })} />
          <OptionRow title="Mouth" options={RECIPE_OPTIONS.MOUTHS} value={recipe.mouth} onChange={(v) => choose({ mouth: v })} />
          <OptionRow title="Hair" options={RECIPE_OPTIONS.HAIRS} value={recipe.hair} onChange={(v) => choose({ hair: v })} />
          <OptionRow
            title="Hair color"
            options={RECIPE_OPTIONS.HAIR_COLORS}
            value={recipe.hairColor}
            onChange={(v) => choose({ hairColor: v })}
            render={(v) => <span className="block h-4 w-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: v }} />}
          />
          <OptionRow title="Accessory" options={RECIPE_OPTIONS.ACCESSORIES} value={recipe.accessory} onChange={(v) => choose({ accessory: v })} />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setRecipe(randomRecipe())}
            className="btn-press flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-bold"
          >
            <Shuffle size={13} /> Surprise me
          </button>
          <button
            onClick={() => {
              clearRecipe();
              onClose();
            }}
            className="btn-press flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-bold text-ink-soft"
          >
            <Trash2 size={13} /> Reset to initials
          </button>
        </div>
        <button
          onClick={() => {
            saveRecipe(recipe);
            onClose();
          }}
          className="btn-press w-full rounded-2xl bg-violet py-3 text-sm font-bold text-white"
        >
          Save avatar
        </button>
      </div>
    </Modal>
  );
}
