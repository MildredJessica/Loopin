"use client";

import { useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { GRADIENTS, cn } from "../lib/utils";
import type { Post } from "../lib/types";
import { useAvatarRecipe } from "../lib/avatarRecipe";
import { Avatar } from "./Avatar";
import { GradientPicker } from "./GradientPicker";

export function Composer({
  onPosted,
  autoFocus,
  placeholder = "What's on the loop?",
}: {
  onPosted?: (p: Post) => void;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("");
  const [withCard, setWithCard] = useState(false);
  const [mediaLabel, setMediaLabel] = useState("");
  const [mediaGradient, setMediaGradient] = useState(GRADIENTS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recipe = useAvatarRecipe(user?.username ?? null, user?.username ?? null);

  if (!user) return null;

  async function submit() {
    if (!body.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const cleanedTag = tag.trim();
      const post = await api<Post>("/posts", {
        method: "POST",
        json: {
          body: body.trim(),
          tag: cleanedTag ? (cleanedTag.startsWith("#") ? cleanedTag : `#${cleanedTag}`) : null,
          mediaLabel: withCard && mediaLabel.trim() ? mediaLabel.trim() : null,
          mediaGradient: withCard ? mediaGradient : null,
        },
      });
      setBody("");
      setTag("");
      setWithCard(false);
      setMediaLabel("");
      if (onPosted) onPosted(post);
      else window.dispatchEvent(new CustomEvent<Post>("loopin:new-post", { detail: post }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't post. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-3 p-4">
      <div className="flex gap-3">
        <Avatar gradient={user.avatarGradient} name={user.name} size={40} recipe={recipe} />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          autoFocus={autoFocus}
          rows={3}
          placeholder={placeholder}
          className="w-full resize-none rounded-2xl border border-line bg-base-2 p-3 text-sm outline-none transition placeholder:text-ink-soft focus:border-violet"
        />
      </div>

      {withCard && (
        <div className="space-y-2 rounded-2xl border border-line bg-base-2 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Color card
            </p>
            <button
              onClick={() => setWithCard(false)}
              className="btn-press text-ink-soft hover:text-ink"
              aria-label="Remove card"
            >
              <X size={14} />
            </button>
          </div>
          <GradientPicker value={mediaGradient} onChange={setMediaGradient} />
          <input
            value={mediaLabel}
            onChange={(e) => setMediaLabel(e.target.value)}
            placeholder="Caption for the card (optional)"
            className="field"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="#tag"
          className="w-28 rounded-full border border-line bg-base-2 px-3 py-2 font-mono text-xs outline-none focus:border-violet"
        />
        <button
          onClick={() => setWithCard((w) => !w)}
          className={cn(
            "btn-press flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold",
            withCard ? "bg-violet-soft text-violet" : "text-ink-soft hover:bg-base-2"
          )}
        >
          <ImagePlus size={14} /> Card
        </button>
        <button
          onClick={submit}
          disabled={busy || !body.trim()}
          className="btn-press ml-auto flex items-center gap-1.5 rounded-full bg-violet px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={13} /> {busy ? "Posting…" : "Post"}
        </button>
      </div>
      {error && <p className="text-xs text-pink">{error}</p>}
    </div>
  );
}
