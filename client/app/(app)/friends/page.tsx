"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { api } from "../../../lib/api";
import type { SuggestionResponse } from "../../../lib/types";
import { Avatar } from "../../../components/Avatar";
import { FollowButton } from "../../../components/FollowButton";
import { EmptyState, ErrorState } from "../../../components/States";
import { Skeleton } from "../../../components/Skeletons";

export default function FriendsPage() {
  const [people, setPeople] = useState<SuggestionResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  function load() {
    setError(null);
    api<SuggestionResponse[]>("/users/suggestions")
      .then(setPeople)
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load suggestions."));
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!people) return null;
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (p) => p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q)
    );
  }, [people, query]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Find your people</h1>
        <p className="text-sm text-ink-soft">
          Suggestions from everyone on Loopin. Follow who feels like your crowd.
        </p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or @handle"
          className="field pl-11"
        />
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {filtered === null && !error && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 rounded-[26px]" />
          ))}
        </div>
      )}
      {filtered?.length === 0 && (
        <EmptyState
          title={query ? "No matches" : "No suggestions yet"}
          body={
            query
              ? `Nobody matches "${query}" yet.`
              : "Check back soon — more people are joining Loopin."
          }
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered?.map((s) => (
          <div key={s.username} className="card flex items-center gap-3 p-4">
            <Link href={`/profile/${s.username}`}>
              <Avatar gradient={s.avatarGradient} name={s.name} size={48} />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/profile/${s.username}`}
                className="block truncate text-sm font-bold hover:text-violet"
              >
                {s.name}
              </Link>
              <p className="truncate font-mono text-xs text-ink-soft">@{s.username}</p>
            </div>
            <FollowButton
              username={s.username}
              initial={s.following}
              small
              onChange={(f) =>
                setPeople(
                  (prev) =>
                    prev?.map((p) => (p.username === s.username ? { ...p, following: f } : p)) ??
                    prev
                )
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
