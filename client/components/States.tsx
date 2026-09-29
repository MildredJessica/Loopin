"use client";

import type { ReactNode } from "react";
import { RobotError } from "./RobotError";

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 p-10 text-center">
      {icon && (
        <div className="squircle flex h-16 w-16 items-center justify-center bg-gradient-to-br from-violet to-pink text-white">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {body && <p className="max-w-sm text-sm text-ink-soft">{body}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return <RobotError message={message} onRetry={onRetry} />;
}
