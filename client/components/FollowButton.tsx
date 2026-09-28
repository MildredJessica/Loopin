"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { cn } from "../lib/utils";

export function FollowButton({
  username,
  initial,
  onChange,
  small,
}: {
  username: string;
  initial: boolean;
  onChange?: (following: boolean) => void;
  small?: boolean;
}) {
  const [following, setFollowing] = useState(initial);
  const [busy, setBusy] = useState(false);

  useEffect(() => setFollowing(initial), [initial]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      await api(`/users/${username}/follow`, { method: following ? "DELETE" : "POST" });
      setFollowing(!following);
      onChange?.(!following);
    } catch {
      // keep the previous state — backend unreachable
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={cn(
        "btn-press rounded-full text-xs font-bold transition",
        small ? "px-3 py-1.5" : "px-5 py-2",
        following ? "bg-base-2 text-ink-soft" : "bg-violet text-white shadow-sm"
      )}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
