"use client";

import { cn, initials } from "../lib/utils";
import type { AvatarRecipe } from "../lib/avatarRecipe";
import { FaceSvg } from "./FaceSvg";

interface AvatarProps {
  gradient: string; // e.g. "from-violet to-pink"
  name: string;
  size?: number;
  shape?: "squircle" | "circle";
  className?: string;
  recipe?: AvatarRecipe | null;
  onClick?: () => void;
}

export function Avatar({
  gradient,
  name,
  size = 44,
  shape = "squircle",
  className,
  recipe,
  onClick,
}: AvatarProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center overflow-hidden bg-gradient-to-br font-bold text-white",
        shape === "squircle" ? "squircle" : "rounded-full",
        gradient,
        className
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
    >
      {!recipe && (
        <span className="relative z-10 tracking-wide drop-shadow-sm">
          {initials(name)}
        </span>
      )}
      {recipe && (
        <FaceSvg recipe={recipe} className="absolute inset-0 z-10 h-full w-full" />
      )}
    </div>
  );
}
