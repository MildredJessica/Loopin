"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Monitor,
  Moon,
  Pencil,
  Sun,
  UserRound,
  Wand2,
} from "lucide-react";
import { API_BASE, api } from "../../../lib/api";
import { useAuth } from "../../../lib/auth";
import { useTheme, type ThemeMode } from "../../../lib/theme";
import { useAvatarRecipe } from "../../../lib/avatarRecipe";
import { cn, prettyGrade } from "../../../lib/utils";
import type { UserProfileResponse } from "../../../lib/types";
import { Avatar } from "../../../components/Avatar";
import { AvatarBuilderModal } from "../../../components/AvatarBuilder";
import { EditProfileModal } from "../../../components/EditProfileModal";

const MODES: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "Auto", icon: Monitor },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { mode, setMode } = useTheme();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [builder, setBuilder] = useState(false);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const recipe = useAvatarRecipe(
    user?.username ?? null,
    user?.username ?? null,
  );

  useEffect(() => {
    if (user)
      api<UserProfileResponse>(`/users/${user.username}`)
        .then(setProfile)
        .catch(() => {});
  }, [user]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      <section className="card space-y-3 p-5 lg:hidden">
        <h2 className="font-display text-sm font-bold">Appearance</h2>
        <div className="flex gap-1 rounded-full border border-line bg-base-2 p-1">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "btn-press flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold",
                  mode === m.id
                    ? "bg-card text-ink shadow-sm"
                    : "text-ink-soft",
                )}
              >
                <Icon size={14} /> {m.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-display text-sm font-bold">Account</h2>
        <div className="flex items-center gap-3">
          <Avatar
            gradient={user.avatarGradient}
            name={user.name}
            size={52}
            recipe={recipe}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{user.name}</p>
            <p className="truncate font-mono text-xs text-ink-soft">
              @{user.username}
            </p>
            {profile?.gradeLabel && (
              <span className="chip mt-1 bg-violet-soft font-mono uppercase text-violet">
                {prettyGrade(profile.gradeLabel)}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/profile"
            className="btn-press flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-bold"
          >
            <UserRound size={13} /> Profile
          </Link>
          <button
            onClick={() => setEditing(true)}
            className="btn-press flex items-center gap-1.5 rounded-full bg-violet px-4 py-2 text-xs font-bold text-white"
          >
            <Pencil size={13} /> Edit profile
          </button>
          <button
            onClick={() => setBuilder(true)}
            className="btn-press flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-bold"
          >
            <Wand2 size={13} /> Avatar style
          </button>
        </div>
      </section>

      <section className="card space-y-2 p-5">
        <h2 className="font-display text-sm font-bold">About</h2>
        <p className="text-xs text-ink-soft">
          API: <span className="font-mono">{API_BASE}</span>
        </p>
        <p className="text-xs leading-relaxed text-ink-soft">
          Sessions are long-lived (7 days) and stored in this browser, not in an
          httpOnly cookie — convenient, but it means an XSS bug could steal your
          token. Don&apos;t log in on shared devices, and we&apos;ll ship
          tighter sessions soon.
        </p>
      </section>

      <section className="card p-5">
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="btn-press flex w-full items-center justify-center gap-2 rounded-2xl border border-pink py-3 text-sm font-bold text-pink"
        >
          <LogOut size={16} /> Log out
        </button>
      </section>

      <EditProfileModal open={editing} onClose={() => setEditing(false)} />
      <AvatarBuilderModal
        open={builder}
        onClose={() => setBuilder(false)}
        gradient={user.avatarGradient}
      />
    </div>
  );
}
