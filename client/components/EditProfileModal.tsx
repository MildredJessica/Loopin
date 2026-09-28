"use client";

import { useEffect, useState } from "react";
import { Wand2 } from "lucide-react";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { GRADE_LABELS, type GradeLabel, type UserProfileResponse } from "../lib/types";
import { prettyGrade } from "../lib/utils";
import { Modal } from "./Modal";
import { GradientPicker } from "./GradientPicker";
import { AvatarBuilderModal } from "./AvatarBuilder";

export function EditProfileModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [grade, setGrade] = useState<GradeLabel | "">("");
  const [gradient, setGradient] = useState("");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      setName(user.name);
      setGradient(user.avatarGradient);
      setError(null);
      // Pull the full profile for bio + grade (not stored in the auth payload).
      api<UserProfileResponse>(`/users/${user.username}`)
        .then((p) => {
          setBio(p.bio ?? "");
          setGrade(p.gradeLabel ?? "");
        })
        .catch(() => {});
    }
  }, [open, user]);

  async function save() {
    if (!user || busy) return;
    setBusy(true);
    setError(null);
    try {
      // Partial update — only send what we manage. Never send updatedAt.
      const updated = await api<UserProfileResponse>(`/users/${user.username}`, {
        method: "PUT",
        json: {
          name: name.trim() || undefined,
          bio: bio.trim() || null,
          avatarGradient: gradient,
          gradeLabel: grade || null,
        },
      });
      updateUser({ name: updated.name, avatarGradient: updated.avatarGradient });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
            Name
          </label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="field" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="What's your vibe?"
            className="field resize-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
            Grade
          </label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value as GradeLabel | "")}
            className="field"
          >
            <option value="">No grade</option>
            {GRADE_LABELS.map((g) => (
              <option key={g} value={g}>
                {prettyGrade(g)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Avatar gradient
            </label>
            <button
              onClick={() => setBuilderOpen(true)}
              className="btn-press flex items-center gap-1 text-xs font-bold text-violet"
            >
              <Wand2 size={13} /> Build your own
            </button>
          </div>
          <GradientPicker value={gradient} onChange={setGradient} />
          <p className="mt-1.5 text-[11px] text-ink-soft">
            The gradient syncs with your profile everywhere. The custom face
            builder is saved on this device only — full sync coming soon.
          </p>
        </div>
        {error && <p className="text-xs text-pink">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-line py-2.5 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="btn-press flex-1 rounded-2xl bg-violet py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
      <AvatarBuilderModal
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        gradient={gradient}
      />
    </Modal>
  );
}
