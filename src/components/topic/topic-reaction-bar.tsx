"use client";

import { useOptimistic, useTransition } from "react";
import { toggleTopicReactionAction } from "@/app/actions/forum";

type ReactionValue = 1 | -1 | 0;

type ReactionState = {
  likeCount: number;
  dislikeCount: number;
  current: ReactionValue;
};

export function TopicReactionBar({
  topicId,
  initialLikeCount,
  initialDislikeCount,
  initialReaction,
}: {
  topicId: string;
  initialLikeCount: number;
  initialDislikeCount: number;
  initialReaction: ReactionValue;
}) {
  const [isPending, startTransition] = useTransition();

  const [optimisticState, setOptimisticState] = useOptimistic<ReactionState, ReactionValue>(
    { likeCount: initialLikeCount, dislikeCount: initialDislikeCount, current: initialReaction },
    (state, nextValue) => {
      let like = state.likeCount;
      let dislike = state.dislikeCount;

      if (state.current === 1) like -= 1;
      if (state.current === -1) dislike -= 1;

      let newCurrent: ReactionValue = nextValue;
      if (state.current === nextValue) {
        newCurrent = 0;
      } else if (nextValue === 1) {
        like += 1;
      } else if (nextValue === -1) {
        dislike += 1;
      }

      return {
        likeCount: Math.max(0, like),
        dislikeCount: Math.max(0, dislike),
        current: newCurrent,
      };
    },
  );

  async function handleReaction(value: ReactionValue) {
    setOptimisticState(value);

    startTransition(async () => {
      try {
        await toggleTopicReactionAction({ topicId, value: value as 1 | -1 });
      } catch (error) {
        console.error("topic reaction optimistic error", error);
      }
    });
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleReaction(1)}
        className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
          optimisticState.current === 1
            ? "border-purple-400/60 bg-purple-500/20 text-purple-200"
            : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
        }`}
      >
        👍 {optimisticState.likeCount}
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() => handleReaction(-1)}
        className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
          optimisticState.current === -1
            ? "border-red-400/50 bg-red-500/15 text-red-200"
            : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
        }`}
      >
        👎 {optimisticState.dislikeCount}
      </button>
    </div>
  );
}
