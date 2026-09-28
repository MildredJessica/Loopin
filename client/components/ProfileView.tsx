"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Users as UsersIcon } from "lucide-react";
import { api } from "../lib/api";
import { cn, formatCount, prettyGrade } from "../lib/utils";
import type { Page, Post, SuggestionResponse, UserProfileResponse } from "../lib/types";
import { useAuth } from "../lib/auth";
import { useAvatarRecipe } from "../lib/avatarRecipe";
import { Avatar } from "./Avatar";
import { Composer } from "./Composer";
import { EditProfileModal } from "./EditProfileModal";
import { EmptyState, ErrorState } from "./States";
import { FollowButton } from "./FollowButton";
import { Modal } from "./Modal";
import { PostCard } from "./PostCard";
import { FeedSkeleton, ProfileSkeleton } from "./Skeletons";

export function ProfileView({ username, isMe }: { username: string; isMe: boolean }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setProfile(await api<UserProfileResponse>(`/users/${username}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load this profile.");
    }
  }, [username]);

  // The API has no per-user posts endpoint, so we page the feed and filter
  // client-side (capped at 5 pages to stay polite).
  const loadPosts = useCallback(async () => {
    try {
      let page = 0, totalPages = 1;
      const mine: Post[] = [];
      while (page < totalPages && page < 5) {
        const d = await api<Page<Post>>(`/posts?page=${page}&size=20`);
        totalPages = d.totalPages;
        mine.push(...d.content.filter((p) => p.authorUsername === username));
        page++;
      }
      setPosts(mine);
    } catch {
      setPosts([]);
    }
  }, [username]);

  useEffect(() => {
    setProfile(null);
    setPosts(null);
    load();
    loadPosts();
  }, [load, loadPosts]);

  const recipe = useAvatarRecipe(username, user?.username ?? null);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!profile) return <ProfileSkeleton />;

  const onChanged = (p: Post) =>
    setPosts((prev) => prev?.map((x) => (x.id === p.id ? p : x)) ?? prev);

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className={cn("relative h-36 bg-gradient-to-br", profile.avatarGradient)}>
          <div className="absolute -left-8 -top-10 h-36 w-36 rounded-full bg-white/15" />
          <div className="absolute -bottom-12 right-10 h-44 w-44 rounded-full bg-black/10" />
        </div>
        <div className="px-5 pb-5">
          <div className="-mt-10 mb-3 flex items-end justify-between">
            <Avatar
              gradient={profile.avatarGradient}
              name={profile.name}
              size={88}
              recipe={isMe ? recipe : null}
              className="ring-4 ring-card"
            />
            {isMe ? (
              <button
                onClick={() => setEditing(true)}
                className="btn-press flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-bold"
              >
                <Pencil size={13} /> Edit profile
              </button>
            ) : (
              <FollowButton
                username={username}
                initial={profile.followedByCurrentUser}
                onChange={(f) =>
                  setProfile((p) =>
                    p
                      ? {
                          ...p,
                          followedByCurrentUser: f,
                          followerCount: p.followerCount + (f ? 1 : -1),
                        }
                      : p
                  )
                }
              />
            )}
          </div>
          <h1 className="font-display text-2xl font-bold">{profile.name}</h1>
          <p className="font-mono text-sm text-ink-soft">@{profile.username}</p>
          {profile.gradeLabel && (
            <div className="mt-2">
              <span className="chip bg-violet-soft font-mono uppercase text-violet">
                {prettyGrade(profile.gradeLabel)}
              </span>
            </div>
          )}
          {profile.bio && <p className="mt-3 text-sm text-ink-soft">{profile.bio}</p>}
          <div className="mt-4 flex gap-6">
            <button onClick={() => setShowFollowers(true)} className="btn-press text-left">
              <span className="font-display text-lg font-bold">
                {formatCount(profile.followerCount)}
              </span>
              <span className="ml-1.5 text-xs text-ink-soft">followers</span>
            </button>
            <button onClick={() => setShowFollowers(true)} className="btn-press text-left">
              <span className="font-display text-lg font-bold">
                {formatCount(profile.followingCount)}
              </span>
              <span className="ml-1.5 text-xs text-ink-soft">following</span>
            </button>
          </div>
        </div>
      </div>

      {isMe && <Composer placeholder="What's on your mind?" />}

      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold">{isMe ? "Your loops" : "Loops"}</h2>
        {posts === null && <FeedSkeleton />}
        {posts?.length === 0 && (
          <EmptyState
            title="No loops yet"
            body={
              isMe
                ? "Post your first loop above — a thought, a color card, a tag."
                : `${profile.name} hasn't posted yet.`
            }
          />
        )}
        {posts?.map((p, i) => (
          <PostCard key={p.id} post={p} index={i} onChanged={onChanged} />
        ))}
      </div>

      <EditProfileModal
        open={editing}
        onClose={() => {
          setEditing(false);
          load();
        }}
      />
      <FollowListsModal open={showFollowers} onClose={() => setShowFollowers(false)} />
    </div>
  );
}

function FollowListsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [people, setPeople] = useState<SuggestionResponse[] | null>(null);
  useEffect(() => {
    if (open)
      api<SuggestionResponse[]>("/users/suggestions").then(setPeople).catch(() => setPeople([]));
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Followers & following">
      <EmptyState
        icon={<UsersIcon size={22} />}
        title="Full follower lists are coming soon"
        body="The backend only exposes counts for now. Until then, here are people you may know:"
      />
      <div className="mt-4 space-y-3">
        {people?.map((s) => (
          <div key={s.username} className="flex items-center gap-2.5">
            <Link href={`/profile/${s.username}`} onClick={onClose}>
              <Avatar gradient={s.avatarGradient} name={s.name} size={36} />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/profile/${s.username}`}
                onClick={onClose}
                className="block truncate text-sm font-bold hover:text-violet"
              >
                {s.name}
              </Link>
              <p className="truncate font-mono text-[11px] text-ink-soft">@{s.username}</p>
            </div>
            <FollowButton username={s.username} initial={s.following} small />
          </div>
        ))}
      </div>
    </Modal>
  );
}
