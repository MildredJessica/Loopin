"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Dark/blurred background */}
      <div className="scrim absolute inset-0" onClick={onClose} />

      {/* ACTUAL POPUP */}
      <div
        className={cn(
          "relative z-10 flex w-full flex-col overflow-hidden",
          "rounded-3xl bg-card shadow-2xl",
          "max-h-50vh",
          wide ? "max-w-2xl" : "max-w-md",
        )}
      >
        {/* HEADER */}
        <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-base-2 px-5">
          <h2 className="font-display text-lg font-bold">{title}</h2>

          <button
            onClick={onClose}
            className="btn-press rounded-full p-2 text-ink-soft hover:bg-base-2 hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        {children}
      </div>
    </div>,
    document.body,
  );
}
