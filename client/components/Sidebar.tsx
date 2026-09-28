"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Home,
  LogOut,
  MessageCircle,
  PenLine,
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { useUnreadCount } from "../lib/useUnreadCount";
import { cn } from "../lib/utils";
import type { NotificationItem, Page, SuggestionResponse } from "../lib/types";
import { Avatar } from "./Avatar";
import { Composer } from "./Composer";
import { Logo } from "./Logo";
import { Modal } from "./Modal";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Home", icon: Home, badge: false },
  { href: "/notifications", label: "Alerts", icon: Bell, badge: true },
  { href: "/friends", label: "Friends", icon: Users, badge: false },
  { href: "/messages", label: "Messages", icon: MessageCircle, badge: false },
  { href: "/settings", label: "Settings", icon: Settings, badge: false },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const unread = useUnreadCount();
  const [postOpen, setPostOpen] = useState(false);
  const [friends, setFriends] = useState<SuggestionResponse[]>([]);

  useEffect(() => {
    let alive = true;
    api<SuggestionResponse[]>("/users/suggestions")
      .then((d) => {
        if (alive) setFriends(d.slice(0, 4));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    // async function prefetchNotifications() {
    //   try {
    //     const cached = sessionStorage.getItem("loopin_notifications");

    //     if (cached) return;

    //     const response = await api<Page<NotificationItem>>(
    //       "/notifications?page=0&size=30",
    //     );

    //     if (!cancelled) {
    //       sessionStorage.setItem(
    //         "loopin_notifications",
    //         JSON.stringify(response.content),
    //       );
    //     }
    //   } catch {
    //     // Prefetch failure should never affect the sidebar.
    //   }
    // }

    // void prefetchNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return null;

  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col gap-4 overflow-y-auto py-6 lg:flex">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <Logo />
      </Link>

      {/* <Link
        href="/profile"
        className="btn-press card flex items-center gap-3 p-3"
      >
        <Avatar gradient={user.avatarGradient} name={user.name} size={40} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{user.name}</p>
          <p className="truncate font-mono text-xs text-ink-soft">
            @{user.username}
          </p>
        </div>
      </Link> */}

      <nav className="flex flex-col gap-1 p-3">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "btn-press flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold",
                active
                  ? "bg-violet-soft text-violet"
                  : "text-ink-soft hover:bg-base-2 hover:text-ink",
              )}
              prefetch
            >
              <span className="relative">
                <Icon size={18} />
                {item.badge && unread > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink px-1 text-[9px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setPostOpen(true)}
        className="btn-press flex items-center justify-center gap-2 rounded-2xl bg-violet py-3 text-sm font-bold text-white shadow-lg"
      >
        <PenLine size={16} /> Post
      </button>

      <div className="mt-auto flex flex-col gap-4">
        <ThemeToggle />
        <Link href="/friends" className="flex items-center px-2">
          <div className="flex -space-x-2.5">
            {friends.map((f) => (
              <Avatar
                key={f.username}
                gradient={f.avatarGradient}
                name={f.name}
                size={30}
                className="ring-2 ring-base"
              />
            ))}
          </div>
          <span className="ml-3 text-xs font-semibold text-ink-soft">
            Your people
          </span>
        </Link>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="btn-press flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-base-2 hover:text-pink"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>

      <Modal
        open={postOpen}
        onClose={() => setPostOpen(false)}
        title="New post"
      >
        <Composer onPosted={() => setPostOpen(false)} autoFocus />
      </Modal>
    </aside>
  );
}
