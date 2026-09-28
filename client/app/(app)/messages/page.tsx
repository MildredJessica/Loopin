"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { EmptyState } from "../../../components/States";

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-lg pt-10">
      <EmptyState
        icon={<MessageCircle size={26} />}
        title="Messages are on the way"
        body="There's no messaging backend yet, so we're not going to fake conversations. When DMs land, they'll live right here — alerts for them already work."
        action={
          <Link
            href="/friends"
            className="btn-press rounded-full bg-violet px-4 py-2 text-xs font-bold text-white"
          >
            Find people to follow
          </Link>
        }
      />
    </div>
  );
}
