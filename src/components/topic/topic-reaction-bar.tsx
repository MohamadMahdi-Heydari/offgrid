"use client";

import { LanternVote, type ReactionValue } from "@/components/reaction/lantern-vote";

type TopicReactionBarProps = {
  topicId: string;
  initialLikeCount: number;
  initialDislikeCount: number;
  initialReaction: ReactionValue;
};

/**
 * «فانوس آفگرید» برای تاپیک — روشن کردن = لایک، خاموش کردن = دیسلایک.
 */
export function TopicReactionBar({ topicId, initialLikeCount, initialDislikeCount, initialReaction }: TopicReactionBarProps) {
  return (
    <div className="mt-5">
      <LanternVote
        targetType="topic"
        targetId={topicId}
        topicId={topicId}
        initialLikeCount={initialLikeCount}
        initialDislikeCount={initialDislikeCount}
        initialReaction={initialReaction}
        size="md"
      />
    </div>
  );
}
