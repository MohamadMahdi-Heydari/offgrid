"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Users, X } from "lucide-react";
import { getFollowListAction, type FollowListUser } from "@/app/actions/forum";
import { RoleBadge } from "@/components/user/role-badge";
import { FollowButton } from "@/components/profile/follow-button";

export type FollowsTab = "followers" | "following";

type FollowsModalProps = {
  userId: string;
  displayName: string;
  tab: FollowsTab;
  onTabChange: (tab: FollowsTab) => void;
  onClose: () => void;
  viewerId: string | null;
  isOwner: boolean;
};

const TAB_LABELS: Record<FollowsTab, string> = {
  followers: "دنبال‌کنندگان",
  following: "دنبال‌شده‌ها",
};

const PAGE_SIZE = 50;

function RowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 px-4 py-3">
      <div className="h-10 w-10 rounded-full bg-zinc-800" />
      <div className="flex-1">
        <div className="h-3.5 w-28 rounded bg-zinc-800" />
        <div className="mt-2 h-3 w-16 rounded bg-zinc-800/70" />
      </div>
      <div className="h-8 w-20 rounded-lg bg-zinc-800/60" />
    </div>
  );
}

export function FollowsModal({ userId, displayName, tab, onTabChange, onClose, viewerId, isOwner }: FollowsModalProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  // نتیجه‌ی آخرین لود — «loading» از ناهماهنگی کلید مشتق می‌شود تا setState همگام در effect لازم نباشد
  type LoadedList = { users: FollowListUser[]; total: number; viewerFollowingIds: string[] };
  const currentKey = `${userId}:${tab}`;
  const [loaded, setLoaded] = useState<{ key: string } & LoadedList | null>(null);
  const [fetchError, setFetchError] = useState<{ key: string; message: string } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const isCurrent = loaded?.key === currentKey;
  const users = isCurrent && loaded ? loaded.users : [];
  const total = isCurrent && loaded ? loaded.total : 0;
  const viewerFollowingIds = isCurrent && loaded ? loaded.viewerFollowingIds : [];
  const loading = !isCurrent;
  const error = fetchError?.key === currentKey ? fetchError.message : null;

  // لود لیست موقع باز/تعویض تب
  useEffect(() => {
    let cancelled = false;
    const key = `${userId}:${tab}`;

    getFollowListAction({ userId, kind: tab, offset: 0 })
      .then((result) => {
        if (cancelled) return;
        setLoaded({ key, users: result.users, total: result.total, viewerFollowingIds: result.viewerFollowingIds });
        setFetchError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("follows modal load error", err);
        setFetchError({ key, message: err instanceof Error ? err.message : "دریافت لیست انجام نشد" });
      });

    return () => {
      cancelled = true;
    };
  }, [userId, tab]);

  // URL همگام با تب
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("follows", tab);
    window.history.replaceState(null, "", url.toString());
    return () => {
      const clean = new URL(window.location.href);
      clean.searchParams.delete("follows");
      window.history.replaceState(null, "", clean.toString());
    };
  }, [tab]);

  // قفل اسکرول بدنه + بستن با ESC
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const loadMore = useCallback(() => {
    if (!loaded || loaded.key !== currentKey) return;
    setLoadingMore(true);
    getFollowListAction({ userId, kind: tab, offset: loaded.users.length })
      .then((result) => {
        setLoaded((prev) =>
          prev && prev.key === currentKey ? { ...prev, users: [...prev.users, ...result.users], total: result.total } : prev,
        );
        setFetchError(null);
      })
      .catch((err) => {
        console.error("follows modal load-more error", err);
        setFetchError({ key: currentKey, message: err instanceof Error ? err.message : "بارگذاری بیشتر انجام نشد" });
      })
      .finally(() => setLoadingMore(false));
  }, [loaded, currentKey, userId, tab]);

  function visitProfile(username: string) {
    onClose();
    router.push(`/u/${username}`);
  }

  const emptyMessage =
    tab === "followers"
      ? isOwner
        ? "هنوز کسی دنبالت نکرده."
        : `${displayName} هنوز دنبال‌کننده‌ای نداره.`
      : isOwner
        ? "هنوز کسی رو دنبال نکردی."
        : `${displayName} هنوز کسی رو دنبال نکرده.`;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* پنل — روی موبایل به شکل bottom-sheet */}
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${TAB_LABELS[tab]} ${displayName}`}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[75vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-zinc-900 sm:inset-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:rounded-2xl"
      >
        {/* هدر + تب‌ها */}
        <div className="flex items-center justify-between border-b border-white/10 pe-2">
          <div className="flex" role="tablist">
            {(Object.keys(TAB_LABELS) as FollowsTab[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => onTabChange(key)}
                className={`px-4 py-3 text-sm transition-colors ${
                  tab === key ? "border-b-2 border-purple-500 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {TAB_LABELS[key]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* فهرست */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div>
              {Array.from({ length: 5 }, (_, index) => (
                <RowSkeleton key={index} />
              ))}
            </div>
          ) : error && users.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-red-400">{error}</p>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <Users className="h-8 w-8 text-zinc-600" aria-hidden="true" />
              <p className="mt-3 text-sm text-zinc-500">{emptyMessage}</p>
            </div>
          ) : (
            <ul>
              {users.map((item) => {
                const itemName = item.displayName || item.username;
                const isSelf = viewerId === item.id;

                return (
                  <li key={item.id}>
                    <div
                      role="link"
                      tabIndex={0}
                      onClick={() => visitProfile(item.username)}
                      onKeyDown={(event) => {
                        if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                          event.preventDefault();
                          visitProfile(item.username);
                        }
                      }}
                      className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5"
                    >
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-purple-500/20">
                        {item.avatarUrl ? (
                          <Image src={item.avatarUrl} alt={itemName} fill className="object-cover" sizes="40px" />
                        ) : (
                          <span className="grid h-full w-full place-items-center text-sm font-bold text-purple-200">
                            {itemName.trim().charAt(0)}
                          </span>
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-zinc-100">{itemName}</span>
                          <RoleBadge role={item.role} size="sm" />
                        </span>
                        <span className="block truncate text-sm text-zinc-500">@{item.username}</span>
                      </span>

                      {!isSelf ? (
                        <span onClick={(event) => event.stopPropagation()} className="shrink-0">
                          <FollowButton targetUserId={item.id} initialFollowing={viewerFollowingIds.includes(item.id)} size="sm" />
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {error && users.length > 0 ? <p className="px-4 py-3 text-center text-xs text-red-400">{error}</p> : null}

          {!loading && users.length > 0 && users.length < total ? (
            <div className="border-t border-white/10 px-4 py-3">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-zinc-300 transition-all duration-200 hover:bg-white/10 active:scale-[0.98] disabled:opacity-60"
              >
                {loadingMore ? "در حال بارگذاری…" : `بارگذاری بیشتر (${total - users.length})`}
              </button>
            </div>
          ) : null}
        </div>
      </motion.div>
    </>
  );
}
