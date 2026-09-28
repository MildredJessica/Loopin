"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { GRADIENTS, cn } from "../lib/utils";
import type { SuggestionResponse } from "../lib/types";
import { Avatar } from "./Avatar";
import { FollowButton } from "./FollowButton";
import { GradientPicker } from "./GradientPicker";
import { Logo } from "./Logo";

const INTERESTS = [
  "Film & photo", "Music", "Gaming", "Fashion", "Art & design", "Sports",
  "Food", "Memes", "Studying", "Travel", "Pets", "Skating",
];

const ORDER = ["welcome", "auth", "gradient", "interests", "follow"] as const;
type Step = (typeof ORDER)[number];

export function Onboarding({
  initialStep,
  onDone,
}: {
  initialStep: Step;
  onDone: () => void;
}) {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState<Step>(initialStep);
  const [gradient, setGradient] = useState(user?.avatarGradient ?? GRADIENTS[0]);
  const [picked, setPicked] = useState<string[]>([]);
  const [people, setPeople] = useState<SuggestionResponse[]>([]);
  const [savingGradient, setSavingGradient] = useState(false);

  useEffect(() => {
    if (step === "follow")
      api<SuggestionResponse[]>("/users/suggestions").then(setPeople).catch(() => setPeople([]));
  }, [step]);

  // Interests are cosmetic and client-side only — there is no backend field.
  useEffect(() => {
    localStorage.setItem("loopin.interests", JSON.stringify(picked));
  }, [picked]);

  function finish() {
    localStorage.setItem("loopin.onboarded", "1");
    onDone();
  }

  async function saveGradient(next: Step) {
    if (user && gradient !== user.avatarGradient) {
      setSavingGradient(true);
      try {
        await api(`/users/${user.username}`, {
          method: "PUT",
          json: { avatarGradient: gradient },
        });
        updateUser({ avatarGradient: gradient });
      } catch {
        // keep going — gradient can be changed later in settings
      }
      setSavingGradient(false);
    }
    setStep(next);
  }

  const stepIndex = ORDER.indexOf(step);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-base">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-violet-soft blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-pink-soft blur-3xl" />
      <div className="relative mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
        <div className="flex justify-center">
          <Logo size={46} />
        </div>
        <div className="flex justify-center gap-1.5">
          {ORDER.map((s, i) => (
            <span
              key={s}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i <= stepIndex ? "w-6 bg-violet" : "w-1.5 bg-line"
              )}
            />
          ))}
        </div>

        <div className="card animate-pop-in w-full p-6">
          {step === "welcome" && (
            <div className="space-y-4 text-center">
              <div className="squircle mx-auto flex h-16 w-16 items-center justify-center bg-gradient-to-br from-violet to-pink text-white">
                <Sparkles size={26} />
              </div>
              <h1 className="font-display text-2xl font-bold">This is your loop.</h1>
              <p className="text-sm text-ink-soft">
                Loopin is the hangout spot for your friend group — stories that
                vanish, loops with your people, and a profile that&apos;s actually yours.
              </p>
              <button
                onClick={() => setStep("auth")}
                className="btn-press mx-auto flex items-center gap-2 rounded-full bg-violet px-6 py-3 text-sm font-bold text-white"
              >
                Get started <ArrowRight size={19} />
              </button>
            </div>
          )}

          {step === "auth" && <AuthStep onRegister={() => setStep("gradient")} onLogin={finish} />}

          {step === "gradient" && user && (
            <div className="space-y-4">
              <h2 className="text-center font-display text-xl font-bold">Pick your colors</h2>
              <p className="text-center text-sm text-ink-soft">
                Your avatar is a gradient squircle with your initials. Choose the
                combo that feels like you.
              </p>
              <div className="flex justify-center">
                <Avatar gradient={gradient} name={user.name} size={96} />
              </div>
              <GradientPicker value={gradient} onChange={setGradient} />
              <button
                onClick={() => saveGradient("interests")}
                disabled={savingGradient}
                className="btn-press w-full rounded-2xl bg-violet py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {savingGradient ? "Saving…" : "Continue"}
              </button>
              <button
                onClick={() => saveGradient("interests")}
                className="w-full text-center text-xs font-semibold text-ink-soft"
              >
                Skip for now
              </button>
            </div>
          )}

          {step === "interests" && (
            <div className="space-y-4">
              <h2 className="text-center font-display text-xl font-bold">What are you into?</h2>
              <p className="text-center text-sm text-ink-soft">
                Just for vibes on this device — nothing is sent anywhere.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {INTERESTS.map((tag) => {
                  const active = picked.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() =>
                        setPicked((prev) =>
                          active ? prev.filter((t) => t !== tag) : [...prev, tag]
                        )
                      }
                      className={cn(
                        "btn-press rounded-full border px-3.5 py-1.5 text-xs font-bold",
                        active ? "border-violet bg-violet-soft text-violet" : "border-line text-ink-soft"
                      )}
                    >
                      {active && <Check size={11} className="mr-1 inline" />}
                      {tag}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setStep("follow")}
                className="btn-press w-full rounded-2xl bg-violet py-3 text-sm font-bold text-white"
              >
                Continue
              </button>
              <button
                onClick={() => setStep("follow")}
                className="w-full text-center text-xs font-semibold text-ink-soft"
              >
                Skip
              </button>
            </div>
          )}

          {step === "follow" && (
            <div className="space-y-4">
              <h2 className="text-center font-display text-xl font-bold">Follow a few people</h2>
              <p className="text-center text-sm text-ink-soft">
                Loops are better with your crowd in them.
              </p>
              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {people.map((s) => (
                  <div key={s.username} className="flex items-center gap-2.5">
                    <Avatar gradient={s.avatarGradient} name={s.name} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{s.name}</p>
                      <p className="truncate font-mono text-[11px] text-ink-soft">@{s.username}</p>
                    </div>
                    <FollowButton
                      username={s.username}
                      initial={s.following}
                      small
                      onChange={(f) =>
                        setPeople((prev) =>
                          prev.map((p) => (p.username === s.username ? { ...p, following: f } : p))
                        )
                      }
                    />
                  </div>
                ))}
                {people.length === 0 && (
                  <p className="py-4 text-center text-sm text-ink-soft">
                    No suggestions yet — you can find people anytime from the Friends tab.
                  </p>
                )}
              </div>
              <button
                onClick={finish}
                className="btn-press w-full rounded-2xl bg-violet py-3 text-sm font-bold text-white"
              >
                Jump in
              </button>
            </div>
          )}
        </div>
        <p className="text-center text-[11px] text-ink-soft">
          Built for you and your people · Loopin
        </p>
      </div>
    </div>
  );
}

function AuthStep({
  onRegister,
  onLogin,
}: {
  onRegister: () => void;
  onLogin: () => void;
}) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        await register(username.trim(), name.trim(), password);
        onRegister();
      } else {
        await login(username.trim(), password);
        onLogin();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex rounded-full border border-line bg-base-2 p-1">
        {(["signup", "login"] as const).map((m) => (
          <button
            type="button"
            key={m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={cn(
              "flex-1 rounded-full py-2 text-xs font-bold",
              mode === m ? "bg-card text-ink shadow-sm" : "text-ink-soft"
            )}
          >
            {m === "signup" ? "Sign up" : "Log in"}
          </button>
        ))}
      </div>
      {mode === "signup" && (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (e.g. Jules Moreno)"
          className="field"
          required
        />
      )}
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username (letters, numbers, . _)"
        className="field font-mono text-xs"
        required
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder={mode === "signup" ? "Password (8+ characters)" : "Password"}
        className="field"
        required
        minLength={mode === "signup" ? 8 : undefined}
      />
      {error && <p className="text-xs text-pink">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="btn-press w-full rounded-2xl bg-violet py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {busy ? "One sec…" : mode === "signup" ? "Create my account" : "Log in"}
      </button>
      <p className="text-center text-[11px] leading-relaxed text-ink-soft">
        By continuing you confirm you&apos;re old enough to hang out here and cool
        with a fun, kind community.
      </p>
    </form>
  );
}
