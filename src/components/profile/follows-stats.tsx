"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FollowsModal, type FollowsTab } from "@/components/profile/follows-modal";

type FollowsStatsProps = {
  userId: string;
  displayName: string;
  followerCount: number;
  followingCount: number;
  viewerId: string | null;
  isOwner: boolean;
  /** تب اولیه از ?follows=… سرور می‌آید تا لینک عمیق بدون چشمک کار کند */
  initialTab: FollowsTab | null;
};

/** «X دنبال‌کننده · Y دنبال‌شده» — کلیک روی هر کدام مودال با همان تب باز می‌کند. */
export function FollowsStats({ userId, displayName, followerCount, followingCount, viewerId, isOwner, initialTab }: FollowsStatsProps) {
  const [openTab, setOpenTab] = useState<FollowsTab | null>(initialTab);

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400">
      <button
        type="button"
        onClick={() => setOpenTab("followers")}
        className="rounded-md px-1 py-0.5 transition-colors hover:bg-white/5 hover:text-zinc-200"
      >
        <span className="font-bold text-zinc-100">{followerCount}</span> دنبال‌کننده
      </button>
      <span aria-hidden="true">·</span>
      <button
        type="button"
        onClick={() => setOpenTab("following")}
        className="rounded-md px-1 py-0.5 transition-colors hover:bg-white/5 hover:text-zinc-200"
      >
        <span className="font-bold text-zinc-100">{followingCount}</span> دنبال‌شده
      </button>

      <AnimatePresence>
        {openTab ? (
          <FollowsModal
            key="follows-modal"
            userId={userId}
            displayName={displayName}
            tab={openTab}
            onTabChange={setOpenTab}
            onClose={() => setOpenTab(null)}
            viewerId={viewerId}
            isOwner={isOwner}
          />
        ) : null}
      </AnimatePresence>
    </span>
  );
}
