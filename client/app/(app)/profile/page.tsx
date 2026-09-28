"use client";

import { useAuth } from "../../../lib/auth";
import { ProfileView } from "../../../components/ProfileView";
import { ProfileSkeleton } from "../../../components/Skeletons";

export default function MyProfilePage() {
  const { user, status } = useAuth();
  if (status === "loading" || !user) return <ProfileSkeleton />;
  return <ProfileView username={user.username} isMe />;
}
