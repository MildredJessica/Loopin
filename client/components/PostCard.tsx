"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { api } from "../lib/api";
import { cn, formatCount, timeAgo } from "../lib/utils";
import type { Post } from "../lib/types";
import { Avatar } from "./Avatar";
import { CommentsSheet } from "./CommentsSheet";

export function PostCard({
  post,
  index = 0,
  onChanged,
}: {
  post: Post;
  index?: number;
  onChanged?: (p: Post) => void;
}) {
  const [p, setP] = useState(post);
  const [likeTick, setLikeTick] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => setP(post), [post]);

  function apply(next: Post) {
    setP(next);
    onChanged?.(next);
  }

  async function toggleLike() {
    const next = !p.likedByCurrentUser;
    setLikeTick((t) => t + 1);
    setP({
      ...p,
      likedByCurrentUser: next,
      likeCount: Math.max(0, p.likeCount + (next ? 1 : -1)),
    });
    try {
      apply(await api<Post>(`/posts/${p.id}/like`, { method: next ? "POST" : "DELETE" }));
    } catch {
      setP(post); // roll back on failure
    }
  }

  return (
    <article
      className="card animate-fade-up space-y-3 p-5"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <div className="flex items-center gap-3">
        <Link href={`/profile/${p.authorUsername}`}>
          <Avatar gradient={p.authorGradient} name={p.authorUsername} size={42} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/profile/${p.authorUsername}`}
            className="block truncate font-mono text-sm font-bold hover:text-violet"
          >
            @{p.authorUsername}
          </Link>
          <p className="font-mono text-[11px] text-ink-soft">{timeAgo(p.createdAt)}</p>
        </div>
      </div>

      <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{p.body}</p>

      {p.tag && <span className="chip bg-violet-soft font-mono text-violet">{p.tag}</span>}

      {p.mediaGradient && (
        <div className={cn("relative h-44 overflow-hidden rounded-2xl bg-gradient-to-br", p.mediaGradient)}>
          <div className="absolute -left-6 -top-8 h-32 w-32 rounded-full bg-white/20" />
          <div className="absolute -bottom-10 right-8 h-40 w-40 rounded-full bg-black/10" />
          {p.mediaLabel && (
            <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {p.mediaLabel}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-5 border-t border-line pt-3">
        <button
          onClick={toggleLike}
          className="btn-press flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-pink"
          aria-label="Like"
        >
          <span key={likeTick} className={cn("inline-flex", likeTick > 0 && "animate-pop")}>
            <Heart size={18} className={cn(p.likedByCurrentUser && "fill-pink text-pink")} />
          </span>
          <span className={cn(p.likedByCurrentUser && "text-pink")}>
            {formatCount(p.likeCount)}
          </span>
        </button>
        <button
          onClick={() => setCommentsOpen(true)}
          className="btn-press flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-violet"
        >
          <MessageCircle size={18} /> {formatCount(p.commentCount)}
        </button>
      </div>

      <CommentsSheet
        post={p}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        onChanged={apply}
      />
    </article>
  );
}
