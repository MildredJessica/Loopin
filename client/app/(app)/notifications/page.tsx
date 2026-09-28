"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCheck,
  Heart,
  MessageCircle,
  Sticker,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { api } from "../../../lib/api";
import { timeAgo } from "../../../lib/utils";
import type { NotificationItem, NotificationType, Page } from "../../../lib/types";
import { Avatar } from "../../../components/Avatar";
import { EmptyState, ErrorState } from "../../../components/States";
import { Skeleton } from "../../../components/Skeletons";

const TYPE_STYLE: Record<NotificationType, { icon: LucideIcon; className: string }> = {
  LIKE: { icon: Heart, className: "bg-pink-soft text-pink" },
  COMMENT: { icon: MessageCircle, className: "bg-violet-soft text-violet" },
  FOLLOW: { icon: UserPlus, className: "bg-mint-soft text-mint" },
  STICKER: { icon: Sticker, className: "bg-sun-soft text-ink" },
};

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

 const load = useCallback(async (background = false) => {
    try {
      const d = await api<Page<NotificationItem>>(
        "/notifications?page=0&size=30"
      );

      setItems((previous) => {
        if (previous) {
          const previousIds = new Set(previous.map((item) => item.id));
          const hasNewNotification = d.content.some(
            (item) => !previousIds.has(item.id)
          );

          if (hasNewNotification) {
            window.dispatchEvent(
              new Event("loopin:notification-change")
            );
          }
        }

        return d.content;
      });

      setError(null);
    } catch (e) {
      if (!background) {
        setError(
          e instanceof Error
            ? e.message
            : "Couldn't load notifications."
        );
      }
    }
  }, []);

  useEffect(() => {
    void load();

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        void load();
      }
    }, 3000);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void load();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  async function markAll() {
    setMarking(true);
    try {
      await api("/notifications/read-all", { method: "PUT" });
      window.dispatchEvent(new Event("loopin:notification-change"));
      await load();
    } finally {
      setMarking(false);
    }
  }

  // The backend stores one row per like (no aggregation) — grouping here is
  // simply "New" (unread) vs "Earlier" (read), straight from the read flag.
  const fresh = items?.filter((i) => !i.read) ?? [];
  const earlier = items?.filter((i) => i.read) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Alerts</h1>
        {fresh.length > 0 && (
          <button
            onClick={markAll}
            disabled={marking}
            className="btn-press flex items-center gap-1.5 rounded-full bg-violet px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            <CheckCheck size={14} /> {marking ? "Marking…" : "Mark all read"}
          </button>
        )}
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {items === null && !error && (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 rounded-2xl" />
          ))}
        </div>
      )}
      {items?.length === 0 && (
        <EmptyState
          title="All quiet"
          body="When people like, comment, follow, or sticker you, it shows up here."
        />
      )}

      {fresh.length > 0 && (
        <section className="space-y-2">
          <h2 className="px-1 text-xs font-bold uppercase tracking-widest text-ink-soft">New</h2>
          {fresh.map((n) => (
            <Row key={n.id} n={n} />
          ))}
        </section>
      )}
      {earlier.length > 0 && (
        <section className="space-y-2">
          <h2 className="px-1 text-xs font-bold uppercase tracking-widest text-ink-soft">Earlier</h2>
          {earlier.map((n) => (
            <Row key={n.id} n={n} />
          ))}
        </section>
      )}
    </div>
  );
}

function Row({ n }: { n: NotificationItem }) {
  const style = TYPE_STYLE[n.type] ?? TYPE_STYLE.LIKE;
  const Icon = style.icon;
  return (
    <div className="card flex items-center gap-3 p-3.5">
      <Avatar gradient={n.actorGradient} name={n.actorUsername} size={38} />
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-mono font-bold">@{n.actorUsername}</span>{" "}
          {n.message.replace(new RegExp(`^@${n.actorUsername}\\s*`), "")}
        </p>
        <p className="text-xs text-ink-soft">{timeAgo(n.createdAt)}</p>
      </div>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.className}`}>
        <Icon size={16} />
      </div>
      {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-violet" />}
    </div>
  );
}
