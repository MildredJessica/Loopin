"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { cn } from "../../lib/utils";
import type { Page, Post } from "../../lib/types";
import { Composer } from "../../components/Composer";
import { EmptyState, ErrorState } from "../../components/States";
import { FeedSkeleton } from "../../components/Skeletons";
import { PostCard } from "../../components/PostCard";
import { RecommendationsPanel } from "../../components/RecommendationsPanel";
import { StoryRow } from "../../components/StoryRow";
import { SuggestionsPanel } from "../../components/SuggestionsPanel";

const TABS = [
  { id: "recents", label: "Recents" },
  { id: "popular", label: "Popular" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("recents");
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(pg: number, append: boolean, background = false) {
    try {
      const d = await api<Page<Post>>(`/posts?page=${pg}&size=20`);

      setPosts((prev) => {
        if (append) {
          const existing = new Set((prev ?? []).map((p) => p.id));
          const incoming = d.content.filter((p) => !existing.has(p.id));

          return [...(prev ?? []), ...incoming];
        }

        // Initial/background refresh:
        // preserve the existing UI if nothing changed.
        if (!prev) return d.content;

        const existingById = new Map(prev.map((p) => [p.id, p]));

        const merged = d.content.map((fresh) => {
          const existing = existingById.get(fresh.id);

          // Backend is authoritative for existing posts.
          return existing ? { ...existing, ...fresh } : fresh;
        });

        const incomingIds = new Set(d.content.map((p) => p.id));

        // Keep any locally-added posts that haven't appeared in the response yet.
        const localOnly = prev.filter((p) => !incomingIds.has(p.id));

        return [...localOnly, ...merged];
      });

      setPage(d.number);
      setTotalPages(d.totalPages);
      setError(null);
    } catch (e) {
      // Don't destroy an already-visible feed because a background
      // refresh failed.
      if (!background) {
        setError(e instanceof Error ? e.message : "Couldn't load your feed.");
      }
    }
  }

  useEffect(() => {
    void load(0, false, false);
  }, []);

  // Composer in the sidebar modal broadcasts here so the feed updates live.
  useEffect(() => {
    const handler = (e: Event) => {
      const p = (e as CustomEvent<Post>).detail;
      setPosts((prev) => (prev ? [p, ...prev] : [p]));
    };
    window.addEventListener("loopin:new-post", handler);
    return () => window.removeEventListener("loopin:new-post", handler);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      void load(0, false, true);
    };

    timer = setInterval(refresh, 3000);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    const poll = window.setInterval(async () => {
      if (document.visibilityState !== "visible") return;

      try {
        const d = await api<Page<Post>>("/posts?page=0&size=20");

        setPosts((current) => {
          if (!current) return d.content;

          const existingIds = new Set(current.map((p) => p.id));

          const newPosts = d.content.filter((p) => !existingIds.has(p.id));

          if (newPosts.length === 0) {
            return current;
          }

          return [...newPosts, ...current];
        });
      } catch {
        // Don't disrupt the existing feed if background refresh fails.
      }
    }, 3000);

    return () => window.clearInterval(poll);
  }, []);

  // "Popular" is a client-side sort by likeCount — the backend has no sort param.
  const visible = posts
    ? tab === "popular"
      ? [...posts].sort((a, b) => b.likeCount - a.likeCount)
      : posts
    : null;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-5">
        <StoryRow />
        <Composer />
        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-full border border-line bg-card p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "btn-press rounded-full px-4 py-1.5 text-xs font-bold",
                  tab === t.id
                    ? "bg-violet text-white"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === "popular" && (
            <span className="text-[11px] text-ink-soft">sorted by likes</span>
          )}
        </div>

        {error && posts === null && (
          <ErrorState message={error} onRetry={() => load(0, false)} />
        )}
        {visible === null && !error && <FeedSkeleton />}
        {visible?.length === 0 && !error && (
          <EmptyState
            title="No loops yet"
            body="Be the first — post something above, or follow people from the Friends tab."
          />
        )}
        <div className="space-y-4">
          {visible?.map((p, i) => (
            <PostCard
              key={p.id}
              post={p}
              index={i}
              onChanged={(np) =>
                setPosts(
                  (prev) => prev?.map((x) => (x.id === np.id ? np : x)) ?? prev,
                )
              }
            />
          ))}
        </div>
        {posts !== null && page + 1 < totalPages && (
          <button
            disabled={loadingMore}
            onClick={async () => {
              setLoadingMore(true);
              await load(page + 1, true);
              setLoadingMore(false);
            }}
            className="btn-press w-full rounded-2xl border border-line py-2.5 text-sm font-bold text-ink-soft hover:text-ink"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        )}
      </div>

      <div className="space-y-5">
        <SuggestionsPanel />
        <RecommendationsPanel />
      </div>
    </div>
  );
}
