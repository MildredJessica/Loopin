"use client";

import { useCallback, useEffect, useState } from "react";
import { ImagePlus, Link2 } from "lucide-react";
import { api } from "../lib/api";
import { cn, timeAgo } from "../lib/utils";
import type { Page, Story } from "../lib/types";
import { Avatar } from "./Avatar";
import { Modal } from "./Modal";
import { Skeleton } from "./Skeletons";

const VIEWED_KEY = "loopin.viewedStories";

function loadViewed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(VIEWED_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

export function StoryRow() {
  const [stories, setStories] = useState<Story[] | null>(null);
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState<Story | null>(null);
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  // The backend already filters to the last 24 hours — no client filtering.
  const load = useCallback(async () => {
    try {
      const d = await api<Page<Story>>("/stories?page=0&size=20");
      setStories(d.content);
    } catch {
      setStories([]);
    }
  }, []);

  useEffect(() => {
    setViewed(loadViewed());
    load();
  }, [load]);

  function openStory(s: Story) {
    setCurrent(s);
    setImgError(false);
    setViewed((prev) => {
      const next = new Set(prev);
      next.add(s.id);
      localStorage.setItem(VIEWED_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-1">
      <button
        onClick={() => setAdding(true)}
        className="flex w-16 shrink-0 flex-col items-center gap-1.5"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-line text-ink-soft transition hover:border-violet hover:text-violet">
          <ImagePlus size={20} />
        </div>
        <span className="text-[11px] font-semibold text-ink-soft">You</span>
      </button>

      {stories === null &&
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex shrink-0 flex-col items-center gap-1.5">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-2.5 w-12" />
          </div>
        ))}

      {stories?.map((s) => (
        <button
          key={s.id}
          onClick={() => openStory(s)}
          className="btn-press flex w-16 shrink-0 flex-col items-center gap-1.5"
        >
          <span
            className={cn(
              "rounded-full p-[3px]",
              viewed.has(s.id) ? "bg-line" : "story-ring"
            )}
          >
            <Avatar gradient={s.authorGradient} name={s.authorUsername} size={58} shape="circle" />
          </span>
          <span className="max-w-full truncate text-[11px] font-semibold text-ink-soft">
            {s.authorUsername}
          </span>
        </button>
      ))}

      {stories?.length === 0 && (
        <p className="self-center text-sm text-ink-soft">
          No fresh stories in the last 24 hours — add yours.
        </p>
      )}

      <Modal open={!!current} onClose={() => setCurrent(null)} wide>
        {current && (
          <div className="relative overflow-hidden rounded-2xl">
            {imgError ? (
              <div className="flex h-80 flex-col items-center justify-center gap-2 bg-gradient-to-br from-violet to-pink text-white">
                <Link2 size={28} />
                <p className="px-8 text-center text-sm">
                  This image link didn&apos;t load. It may have expired or moved.
                </p>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={current.imageUrl}
                alt={`Story by ${current.authorUsername}`}
                onError={() => setImgError(true)}
                className="max-h-[70vh] w-full object-cover"
              />
            )}
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/45 py-1.5 pl-1.5 pr-3 backdrop-blur-sm">
              <Avatar gradient={current.authorGradient} name={current.authorUsername} size={26} shape="circle" />
              <span className="font-mono text-xs font-bold text-white">
                @{current.authorUsername}
              </span>
              <span className="text-[10px] text-white/70">{timeAgo(current.createdAt)}</span>
            </div>
          </div>
        )}
      </Modal>

      <AddStoryModal
        open={adding}
        onClose={() => setAdding(false)}
        onPosted={() => {
          setAdding(false);
          load();
        }}
      />
    </div>
  );
}

function AddStoryModal({
  open,
  onClose,
  onPosted,
}: {
  open: boolean;
  onClose: () => void;
  onPosted: () => void;
}) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (open) {
      setUrl("");
      setError(null);
      setPreviewError(false);
    }
  }, [open]);

  async function submit() {
    if (!url.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      // Body is ONLY imageUrl — the server fills in the author from the JWT.
      await api<Story>("/stories", { method: "POST", json: { imageUrl: url.trim() } });
      onPosted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't post the story.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a story">
      <div className="space-y-3">
        <p className="rounded-2xl bg-sun-soft p-3 text-xs font-medium leading-relaxed">
          Loopin can&apos;t upload photos yet — paste a link to an image that&apos;s
          already hosted (a direct .jpg/.png URL), and you&apos;ll see a live preview.
        </p>
        <input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setPreviewError(false);
          }}
          placeholder="https://…"
          className="field font-mono text-xs"
          autoFocus
        />
        {url.trim() && !previewError && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={url.trim()}
            alt="Story preview"
            onError={() => setPreviewError(true)}
            className="max-h-64 w-full rounded-2xl object-cover"
          />
        )}
        {url.trim() && previewError && (
          <p className="text-xs text-pink">That link doesn&apos;t look like a loadable image.</p>
        )}
        <button
          onClick={submit}
          disabled={busy || !url.trim()}
          className="btn-press w-full rounded-2xl bg-violet py-2.5 text-sm font-bold text-white disabled:opacity-40"
        >
          {busy ? "Posting…" : "Share to story"}
        </button>
        {error && <p className="text-xs text-pink">{error}</p>}
      </div>
    </Modal>
  );
}
