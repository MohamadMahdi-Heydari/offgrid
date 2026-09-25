"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, UserMinus, UserPlus } from "lucide-react";
import { toggleFollowUserAction } from "@/app/actions/forum";

type FollowButtonProps = {
  targetUserId: string;
  initialFollowing: boolean;
  size?: "sm" | "md";
};

/**
 * دکمه‌ی دنبال‌کردن — الگوی خوش‌بینانه مثل فانوس.
 * مهمان که کلیک کند، اکشن او را به /login هدایت می‌کند.
 */
export function FollowButton({ targetUserId, initialFollowing, size = "md" }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [view, addOptimistic] = useOptimistic<boolean, boolean>(following, (_current, next) => next);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // همگام‌سازی با props تازه از سرور
  const propsKey = `${targetUserId}:${initialFollowing}`;
  const [lastPropsKey, setLastPropsKey] = useState(propsKey);
  if (propsKey !== lastPropsKey) {
    setLastPropsKey(propsKey);
    setFollowing(initialFollowing);
  }

  function toggle() {
    if (isPending) return;
    setError(null);

    startTransition(async () => {
      addOptimistic(!view);
      try {
        const result = await toggleFollowUserAction({ targetUserId });
        setFollowing(result.following);
      } catch (err) {
        console.error("follow toggle error", err);
        setError(err instanceof Error ? err.message : "عملیات انجام نشد؛ دوباره تلاش کن");
      }
    });
  }

  const sizeCls = size === "md" ? "h-10 px-4 text-sm rounded-xl" : "h-8 px-3 text-xs rounded-lg";
  const iconCls = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-pressed={view}
        aria-label={view ? "لغو دنبال‌کردن" : "دنبال‌کردن"}
        className={`group inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-200 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 ${sizeCls} ${
          view
            ? "border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300"
            : "bg-purple-500 text-white hover:bg-purple-600"
        }`}
      >
        {view ? (
          <>
            <span className="inline-flex items-center gap-1.5 group-hover:hidden">
              <Check className={iconCls} aria-hidden="true" />
              دنبال می‌کنی
            </span>
            <span className="hidden items-center gap-1.5 text-red-300 group-hover:inline-flex">
              <UserMinus className={iconCls} aria-hidden="true" />
              لغو دنبال
            </span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <UserPlus className={iconCls} aria-hidden="true" />
            دنبال کردن
          </span>
        )}
      </button>
      {error ? <span className="mt-1 text-xs text-red-400">{error}</span> : null}
    </span>
  );
}
