"use client";

import { useEffect, useState } from "react";

// The layered "build your own avatar" recipe. The backend only stores one
// VARCHAR(60) gradient column today, so this recipe is persisted per-device
// in localStorage — a single serializable JSON value, ready to be lifted
// into a future avatar_config column without redesigning the picker.
export interface AvatarRecipe {
  face: string;
  eyes: string;
  mouth: string;
  accessory: string;
  hair: string;
  hairColor: string;
}

const KEY = "loopin.avatarRecipe";

const FACES = ["round", "square", "heart"];
const EYES = ["dots", "happy", "stars", "hearts"];
const MOUTHS = ["smile", "grin", "smirk", "o"];
const ACCESSORIES = ["none", "glasses", "headphones"];
const HAIRS = ["none", "fringe", "curly", "bun"];
const HAIR_COLORS = ["#15121F", "#7C5CFC", "#FF5C8A", "#20D3A0", "#FFC93C", "#F3F1FF"];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomRecipe(): AvatarRecipe {
  return {
    face: pick(FACES),
    eyes: pick(EYES),
    mouth: pick(MOUTHS),
    accessory: pick(ACCESSORIES),
    hair: pick(HAIRS),
    hairColor: pick(HAIR_COLORS),
  };
}

export function getStoredRecipe(): AvatarRecipe | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AvatarRecipe) : null;
  } catch {
    return null;
  }
}

export function saveRecipe(recipe: AvatarRecipe) {
  localStorage.setItem(KEY, JSON.stringify(recipe));
  window.dispatchEvent(new Event("loopin:avatar-recipe"));
}

export function clearRecipe() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("loopin:avatar-recipe"));
}

/** Returns the device-stored face recipe, but only for the logged-in user. */
export function useAvatarRecipe(username: string | null, me: string | null): AvatarRecipe | null {
  const [recipe, setRecipe] = useState<AvatarRecipe | null>(null);
  useEffect(() => {
    const read = () =>
      setRecipe(username && me && username === me ? getStoredRecipe() : null);
    read();
    window.addEventListener("loopin:avatar-recipe", read);
    return () => window.removeEventListener("loopin:avatar-recipe", read);
  }, [username, me]);
  return recipe;
}

export const RECIPE_OPTIONS = {
  FACES,
  EYES,
  MOUTHS,
  ACCESSORIES,
  HAIRS,
  HAIR_COLORS,
} as const;
