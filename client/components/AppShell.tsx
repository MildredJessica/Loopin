"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Bell,
  Home,
  MessageCircle,
  Settings,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth";
import { useUnreadCount } from "../lib/useUnreadCount";
import { cn } from "../lib/utils";
import { Logo } from "./Logo";
import { LoopinLoader } from "./LoopinLoader";
import { Onboarding } from "./Onboarding";
import { Sidebar } from "./Sidebar";

function Splash() {
  return <LoopinLoader fullScreen />;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  const pathname = usePathname();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    setOnboarded(localStorage.getItem("loopin.onboarded") === "1");
  }, [user]);

  if (status === "loading" || (user && onboarded === null)) return <Splash />;
  if (!user)
    return (
      <Onboarding initialStep="welcome" onDone={() => setOnboarded(true)} />
    );
  if (!onboarded)
    return (
      <Onboarding initialStep="gradient" onDone={() => setOnboarded(true)} />
    );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1380px] flex-col gap-6 px-4 sm:px-6 lg:flex-row">
      <MobileHeader />
      <Sidebar />
      <main key={pathname} className="page-enter min-w-0 flex-1 py-6">
        {pathname !== "/" && <BackButton />}
        {children}
      </main>
    </div>
  );
}

function MobileHeader() {
  const { user } = useAuth();
  const pathname = usePathname();
  const unread = useUnreadCount();
  if (!user) return null;

  const items = [
    { href: "/", icon: Home, label: "Home", badge: 0 },
    { href: "/notifications", icon: Bell, label: "Alerts", badge: unread },
    { href: "/friends", icon: Users, label: "Friends", badge: 0 },
    { href: "/messages", icon: MessageCircle, label: "Messages", badge: 0 },
    { href: "/settings", icon: Settings, label: "Settings", badge: 0 },
  ];

  return (
    <header className="sticky top-0 z-40 -mx-4 flex flex-col gap-2 border-b border-line bg-base px-4 py-3 sm:-mx-6 sm:px-6 lg:hidden">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Logo wordmark={false} size={30} />
        </Link>
      </div>
      <nav className="flex justify-between">
        {items.map((it) => {
          const active =
            it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-label={it.label}
              className={cn(
                "btn-press relative rounded-full p-2",
                active ? "bg-violet-soft text-violet" : "text-ink-soft",
              )}
            >
              <Icon size={19} />
              {it.badge > 0 && (
                <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-pink" />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/");
      }}
      className="btn-press mb-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-card px-3 text-sm font-semibold text-ink-soft hover:text-ink"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      Back
    </button>
  );
}
