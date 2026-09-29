"use client";

import { RobotError } from "../../components/RobotError";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RobotError
      message="Something unexpected got in the way. Give it another try, or head back to your feed."
      onRetry={reset}
      digest={error.digest}
      fullScreen
    />
  );
}
