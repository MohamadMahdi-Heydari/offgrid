"use client";

import { useEffect, useOptimistic, useState, useTransition, type CSSProperties } from "react";
import { toggleReactionTargetAction } from "@/app/actions/forum";
import { OffgridLantern } from "@/components/brand/offgrid-lantern";

export type ReactionValue = 1 | -1 | 0;

type VoteState = {
  likeCount: number;
  dislikeCount: number;
  current: ReactionValue;
};

function applyVote(state: VoteState, nextValue: 1 | -1): VoteState {
  let like = state.likeCount;
  let dislike = state.dislikeCount;

  if (state.current === 1) like -= 1;
  if (state.current === -1) dislike -= 1;

  let current: ReactionValue = nextValue;
  if (state.current === nextValue) {
    current = 0;
  } else if (nextValue === 1) {
    like += 1;
  } else {
    dislike += 1;
  }

  return {
    likeCount: Math.max(0, like),
    dislikeCount: Math.max(0, dislike),
    current,
  };
}

function LightBurst({ tone, color }: { tone: 1 | -1; color: string }) {
  return (
    <span className="pointer-events-none absolute -inset-1" aria-hidden="true" data-burst={tone}>
      <span className="lantern-burst" style={{ "--burst-color": color } as CSSProperties} />
      {[0, 72, 144, 216, 288].map((angle) => (
        <span
          key={angle}
          className="lantern-spark"
          style={{ "--a": `${angle}deg`, "--burst-color": color } as CSSProperties}
        />
      ))}
    </span>
  );
}

type LanternVoteProps = {
  targetType: "topic" | "reply";
  targetId: string;
  topicId: string;
  initialLikeCount: number;
  initialDislikeCount: number;
  initialReaction: ReactionValue;
  size?: "md" | "sm";
};

export function LanternVote({
  targetType,
  targetId,
  topicId,
  initialLikeCount,
  initialDislikeCount,
  initialReaction,
  size = "md",
}: LanternVoteProps) {
  const [baseState, setBaseState] = useState<VoteState>({
    likeCount: initialLikeCount,
    dislikeCount: initialDislikeCount,
    current: initialReaction,
  });

  // همگام‌سازی با props تازه بعد از revalidate روت
  useEffect(() => {
    setBaseState({
      likeCount: initialLikeCount,
      dislikeCount: initialDislikeCount,
      current: initialReaction,
    });
  }, [initialLikeCount, initialDislikeCount, initialReaction]);

  const [view, addOptimistic] = useOptimistic<VoteState, 1 | -1>(baseState, applyVote);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ value: 1 | -1; key: number } | null>(null);

  function vote(value: 1 | -1) {
    if (isPending) return;
    setError(null);

    startTransition(async () => {
      // آپدیت خوش‌بینانه باید «داخل» transition باشد، نه بیرون از آن.
      addOptimistic(value);
      try {
        const result = await toggleReactionTargetAction({ targetType, targetId, topicId, value });
        setBaseState({
          likeCount: result.likeCount,
          dislikeCount: result.dislikeCount,
          current: result.current,
        });
        if (result.current !== 0) {
          setBurst({ value: result.current, key: Date.now() });
        }
      } catch (err) {
        console.error("lantern vote error", err);
        setError(err instanceof Error ? err.message : "ثبت واکنش انجام نشد؛ دوباره تلاش کن");
      }
    });
  }

  const lanternSize = size === "sm" ? 17 : 26;
  const buttonPadding = size === "sm" ? "px-2.5 py-1.5 gap-1.5 text-xs rounded-lg" : "px-3.5 py-2 gap-2 text-sm rounded-xl";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => vote(1)}
            disabled={isPending}
            aria-pressed={view.current === 1}
            title="روشن کردن فانوس (لایک)"
            aria-label={`فانوس روشنی، ${view.likeCount} نفر`}
            className={`lantern-btn inline-flex items-center font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 ${buttonPadding} ${
              view.current === 1
                ? "border border-purple-400/60 bg-purple-500/15 text-purple-100 shadow-[0_0_18px_-4px_rgba(168,85,247,0.55)]"
                : "border border-white/10 bg-white/5 text-zinc-400 hover:border-purple-400/40 hover:bg-white/10 hover:text-purple-200"
            }`}
          >
            <OffgridLantern lit={view.current === 1} tone="purple" size={lanternSize} />
            <span className={view.current === 1 ? "font-bold" : ""}>{view.likeCount}</span>
          </button>
          {burst?.value === 1 ? <LightBurst key={burst.key} tone={1} color="#A855F7" /> : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => vote(-1)}
            disabled={isPending}
            aria-pressed={view.current === -1}
            title="خاموش کردن فانوس (دیسلایک)"
            aria-label={`فانوس خاموشی، ${view.dislikeCount} نفر`}
            className={`lantern-btn inline-flex items-center font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 ${buttonPadding} ${
              view.current === -1
                ? "border border-red-400/50 bg-red-500/12 text-red-100 shadow-[0_0_18px_-4px_rgba(239,68,68,0.5)]"
                : "border border-white/10 bg-white/5 text-zinc-400 hover:border-red-400/40 hover:bg-white/10 hover:text-red-200"
            }`}
          >
            <span className="inline-block rotate-180">
              <OffgridLantern lit={view.current === -1} tone="red" size={lanternSize} />
            </span>
            <span className={view.current === -1 ? "font-bold" : ""}>{view.dislikeCount}</span>
          </button>
          {burst?.value === -1 ? <LightBurst key={burst.key} tone={-1} color="#EF4444" /> : null}
        </div>
      </div>

      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
