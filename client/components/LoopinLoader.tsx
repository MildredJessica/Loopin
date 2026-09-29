import { Logo } from "./Logo";
import styles from "./LoopinLoader.module.css";

export function LoopinLoader({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div
      role="status"
      aria-label="Loading Loopin"
      className={`flex flex-col items-center justify-center gap-5 px-6 ${
        fullScreen ? `min-h-screen ${styles.stage}` : "min-h-[56vh]"
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 240 240"
        className={`${styles.mark} h-32 w-32 sm:h-40 sm:w-40`}
      >
        <defs>
          <linearGradient
            id="loopin-loader-gradient"
            x1="20"
            y1="20"
            x2="160"
            y2="160"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#7C5CFC" />
            <stop offset="1" stopColor="#FF5C8A" />
          </linearGradient>
        </defs>
        <g transform="rotate(-16 90 90)">
          <rect
            className={styles.ringA}
            x="20"
            y="20"
            width="140"
            height="140"
            rx="48"
            strokeWidth="24"
          />
        </g>
        <g transform="rotate(16 150 150)">
          <rect
            className={styles.ringB}
            x="80"
            y="80"
            width="140"
            height="140"
            rx="48"
            strokeWidth="24"
          />
        </g>
        <rect
          className={styles.spark}
          x="104"
          y="104"
          width="32"
          height="32"
          rx="11"
          fill="#FFC93C"
          transform="rotate(-10 120 120)"
        />
      </svg>
      <div className="flex flex-col items-center gap-2">
        <Logo size={28} />
        <p className="text-sm font-medium text-ink-soft">
          Getting your space ready
        </p>
        <span className="sr-only">Please wait</span>
      </div>
    </div>
  );
}
