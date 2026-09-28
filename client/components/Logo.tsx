import Image from "next/image";

export function Logo({ wordmark = true, size = 34 }: { wordmark?: boolean; size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <Image src="/logo.svg" alt="Loopin logo" width={size} height={size} priority />
      {wordmark && (
        <span className="font-display text-[22px] font-bold tracking-tight">Loopin</span>
      )}
    </span>
  );
}
