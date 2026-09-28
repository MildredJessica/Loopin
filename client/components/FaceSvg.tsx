import type { AvatarRecipe } from "../lib/avatarRecipe";

const SKIN = "#FFDFC4";
const INK = "#15121F";

/** Layered face, composited as one inline SVG over the gradient squircle. */
export function FaceSvg({
  recipe,
  className,
}: {
  recipe: AvatarRecipe;
  className?: string;
}) {
  const hc = recipe.hairColor;

  let face = <circle cx="50" cy="56" r="30" fill={SKIN} />;
  if (recipe.face === "square")
    face = <rect x="23" y="30" width="54" height="50" rx="16" fill={SKIN} />;
  if (recipe.face === "heart")
    face = (
      <path
        d="M50 86 C22 68 20 40 38 33 C45 30 50 36 50 42 C50 36 55 30 62 33 C80 40 78 68 50 86 Z"
        fill={SKIN}
      />
    );

  let eyes = (
    <>
      <circle cx="40" cy="55" r="3.2" fill={INK} />
      <circle cx="60" cy="55" r="3.2" fill={INK} />
    </>
  );
  if (recipe.eyes === "happy")
    eyes = (
      <>
        <path d="M34 56 Q40 49 46 56" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M54 56 Q60 49 66 56" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </>
    );
  if (recipe.eyes === "stars")
    eyes = (
      <>
        <path d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" transform="translate(40 55)" fill={INK} />
        <path d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" transform="translate(60 55)" fill={INK} />
      </>
    );
  if (recipe.eyes === "hearts")
    eyes = (
      <>
        <path d="M0 5 C-4 1 -6 -1 -6 -4 C-6 -7 -3 -8 0 -5 C3 -8 6 -7 6 -4 C6 -1 4 1 0 5 Z" transform="translate(40 53) scale(0.9)" fill="#FF5C8A" />
        <path d="M0 5 C-4 1 -6 -1 -6 -4 C-6 -7 -3 -8 0 -5 C3 -8 6 -7 6 -4 C6 -1 4 1 0 5 Z" transform="translate(60 53) scale(0.9)" fill="#FF5C8A" />
      </>
    );

  let mouth = (
    <path d="M42 66 Q50 73 58 66" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
  );
  if (recipe.mouth === "grin")
    mouth = <path d="M41 64 Q50 77 59 64 Q50 70 41 64 Z" fill={INK} />;
  if (recipe.mouth === "smirk")
    mouth = (
      <path d="M42 68 Q51 72 58 63" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    );
  if (recipe.mouth === "o") mouth = <circle cx="50" cy="68" r="3.6" fill={INK} />;

  let accessory: React.ReactNode = null;
  if (recipe.accessory === "glasses")
    accessory = (
      <>
        <circle cx="40" cy="55" r="9" fill="rgba(255,255,255,0.18)" stroke={INK} strokeWidth="3" />
        <circle cx="60" cy="55" r="9" fill="rgba(255,255,255,0.18)" stroke={INK} strokeWidth="3" />
        <path d="M49 55 L51 55 M31 54 L24 51 M69 54 L76 51" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </>
    );
  if (recipe.accessory === "headphones")
    accessory = (
      <>
        <path d="M25 52 A25 25 0 0 1 75 52" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="20" y="48" width="9" height="15" rx="4.5" fill={INK} />
        <rect x="71" y="48" width="9" height="15" rx="4.5" fill={INK} />
      </>
    );

  let hair: React.ReactNode = null;
  if (recipe.hair === "fringe")
    hair = (
      <path
        d="M21 54 C18 26 38 18 50 18 C62 18 82 26 79 54 C73 40 65 35 58 39 C55 31 45 31 42 39 C35 35 27 40 21 54 Z"
        fill={hc}
      />
    );
  if (recipe.hair === "curly")
    hair = (
      <>
        <circle cx="34" cy="30" r="12" fill={hc} />
        <circle cx="50" cy="24" r="13" fill={hc} />
        <circle cx="66" cy="30" r="12" fill={hc} />
      </>
    );
  if (recipe.hair === "bun")
    hair = (
      <>
        <circle cx="50" cy="20" r="9" fill={hc} />
        <path d="M24 54 A26 26 0 0 1 76 54 Z" fill={hc} />
      </>
    );

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {face}
      <circle cx="33" cy="62" r="4" fill="#FF5C8A" opacity="0.35" />
      <circle cx="67" cy="62" r="4" fill="#FF5C8A" opacity="0.35" />
      {hair}
      {eyes}
      {mouth}
      {accessory}
    </svg>
  );
}
