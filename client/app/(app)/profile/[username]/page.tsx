"use client";

import { useParams } from "next/navigation";
import { useAuth } from "../../../../lib/auth";
import { ProfileSkeleton } from "../../../../components/Skeletons";
import { ProfileView } from "../../../../components/ProfileView";

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user, status } = useAuth();

  if (status === "loading") return <ProfileSkeleton />;
  if (!user) return null;
  if (username === user.username) return <ProfileView username={username} isMe />;
  return <ProfileView username={username} isMe={false} />;
}
