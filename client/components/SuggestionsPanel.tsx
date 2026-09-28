"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { SuggestionResponse } from "../lib/types";
import { Avatar } from "./Avatar";
import { FollowButton } from "./FollowButton";
import { Skeleton } from "./Skeletons";

export function SuggestionsPanel() {
  const [people, setPeople] = useState<SuggestionResponse[] | null>(null);

  useEffect(() => {
    api<SuggestionResponse[]>("/users/suggestions").then(setPeople).catch(() => setPeople([]));
  }, []);

  return (
    <section className="card space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold">People to follow</h3>
        <Link href="/friends" className="text-xs font-bold text-violet hover:underline">
          See all
        </Link>
      </div>
      {people === null && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
          ))}
        </div>
      )}
      {people?.map((s) => (
        <div key={s.username} className="flex items-center gap-2.5">
          <Link href={`/profile/${s.username}`}>
            <Avatar gradient={s.avatarGradient} name={s.name} size={36} />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={`/profile/${s.username}`}
              className="block truncate text-sm font-bold hover:text-violet"
            >
              {s.name}
            </Link>
            <p className="truncate font-mono text-[11px] text-ink-soft">@{s.username}</p>
          </div>
          <FollowButton
            username={s.username}
            initial={s.following}
            small
            onChange={(f) =>
              setPeople((prev) =>
                prev?.map((p) => (p.username === s.username ? { ...p, following: f } : p)) ?? prev
              )
            }
          />
        </div>
      ))}
      {people?.length === 0 && (
        <p className="text-xs text-ink-soft">
          No suggestions right now — invite your friends!
        </p>
      )}
    </section>
  );
}
