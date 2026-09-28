"use client";

import { useCallback, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { api } from "../lib/api";
import { timeAgo } from "../lib/utils";
import type { Comment, Page, Post } from "../lib/types";
import { Avatar } from "./Avatar";
import { Modal } from "./Modal";
import { Skeleton } from "./Skeletons";

export function CommentsSheet({
  post,
  open,
  onClose,
  onChanged,
}: {
  post: Post;
  open: boolean;
  onClose: () => void;
  onChanged: (p: Post) => void;
}) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (pg: number, append: boolean) => {
      try {
        const d = await api<Page<Comment>>(
          `/posts/${post.id}/comments?page=${pg}&size=20`,
        );

        setComments((prev) =>
          append ? [...(prev ?? []), ...d.content] : d.content,
        );

        setPage(d.number);
        setTotalPages(d.totalPages);
      } catch {
        setComments((prev) => prev ?? []);
      }
    },
    [post.id],
  );

  useEffect(() => {
    if (open) {
      setComments(null);
      setText("");
      setPage(0);
      load(0, false);
    }
  }, [open, load]);

  async function send() {
    if (!text.trim() || busy) return;

    setBusy(true);

    try {
      const c = await api<Comment>(`/posts/${post.id}/comments`, {
        method: "POST",
        json: {
          text: text.trim(),
        },
      });

      setComments((prev) => [c, ...(prev ?? [])]);
      setText("");

      onChanged({
        ...post,
        commentCount: post.commentCount + 1,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Comments">
      {/* Fixed popup body */}
      <div className="flex h-[250px] min-h-0 flex-col">
        {/* ONLY THIS AREA SCROLLS */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {comments === null && (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />

                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {comments?.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-sm text-ink-soft">
                No comments yet — say something nice.
              </p>
            </div>
          )}

          {comments && comments.length > 0 && (
            <div className="space-y-5">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar
                    gradient={c.authorGradient}
                    name={c.authorUsername}
                    size={34}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-bold">
                      @{c.authorUsername}{" "}
                      <span className="ml-1 font-sans font-normal text-ink-soft">
                        {timeAgo(c.createdAt)}
                      </span>
                    </p>

                    <p className="mt-1 break-words text-sm leading-5">
                      {c.text}
                    </p>
                  </div>
                </div>
              ))}

              {page + 1 < totalPages && (
                <button
                  onClick={() => load(page + 1, true)}
                  className="pb-2 text-xs font-bold text-violet"
                >
                  Load more
                </button>
              )}
            </div>
          )}
        </div>

        {/* COMMENT INPUT — NEVER SCROLLS AWAY */}
        <div className="shrink-0 border-t border-base-2 bg-card px-5 py-4">
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  send();
                }
              }}
              placeholder="Add a comment…"
              className="field min-w-0 flex-1"
              autoFocus
            />

            <button
              onClick={send}
              disabled={busy || !text.trim()}
              className="btn-press shrink-0 rounded-full bg-violet p-2.5 text-white disabled:opacity-40"
              aria-label="Send comment"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
