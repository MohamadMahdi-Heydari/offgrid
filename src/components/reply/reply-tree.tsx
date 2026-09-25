import { MessageCirclePlus } from "lucide-react";
import { createReplyAction, selectBestReplyAction } from "@/app/actions/forum";
import { renderMarkdown } from "@/lib/markdown";
import type { ReplyItem } from "@/lib/forum-data";
import { LanternVote } from "@/components/reaction/lantern-vote";
import { EmptyState } from "@/components/ui/empty-state";
import { ReplyAuthor } from "@/components/reply/reply-author";
import { ReplyCardLink } from "@/components/reply/reply-card-link";

type ViewerReactions = Record<string, 1 | -1>;

type ReplyTreeProps = {
  topicId: string;
  replies: ReplyItem[];
  bestReplyId: string | null;
  canSelectBest: boolean;
  viewerReactions: ViewerReactions;
  viewerId: string | null;
};

function ReplyNode({
  reply,
  allReplies,
  topicId,
  canSelectBest,
  depth,
  isBest,
  viewerReactions,
  viewerId,
}: {
  reply: ReplyItem;
  allReplies: ReplyItem[];
  topicId: string;
  canSelectBest: boolean;
  depth: number;
  isBest: boolean;
  viewerReactions: ViewerReactions;
  viewerId: string | null;
}) {
  const children = allReplies
    .filter((item) => item.parentId === reply.id)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const anchorId = `reply-${reply.id}`;

  return (
    <li className="mt-4" style={{ marginInlineStart: `${depth * 24}px` }}>
      <ReplyCardLink href={`/t/${topicId}#${anchorId}`}>
        <article
          id={anchorId}
          className={`scroll-mt-24 rounded-xl border transition-[box-shadow] duration-500 ${
            isBest ? "border-emerald-400/40" : "border-white/10"
          } bg-zinc-900/60 p-4`}
        >
          <ReplyAuthor
            author={{
              username: reply.authorUsername,
              displayName: reply.authorDisplayName,
              avatarUrl: reply.authorAvatarUrl,
              role: reply.authorRole,
            }}
            replyCreatedAt={reply.createdAt}
            isMe={viewerId !== null && viewerId === reply.authorId}
          />

          <div className="text-sm leading-relaxed text-zinc-200" dangerouslySetInnerHTML={{ __html: renderMarkdown(reply.body) }} />

          <div data-reply-nolink className="mt-3 flex flex-wrap items-center gap-2">
          <LanternVote
            targetType="reply"
            targetId={reply.id}
            topicId={topicId}
            initialLikeCount={reply.likeCount}
            initialDislikeCount={reply.dislikeCount}
            initialReaction={viewerReactions[reply.id] ?? 0}
            size="sm"
          />

          {canSelectBest ? (
            <form action={selectBestReplyAction}>
              <input type="hidden" name="topic_id" value={topicId} />
              <input type="hidden" name="reply_id" value={reply.id} />
              <button type="submit" className="rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20">
                انتخاب بهترین پاسخ
              </button>
            </form>
          ) : null}

          <details>
            <summary className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-200 hover:bg-white/10">
              پاسخ
            </summary>
            <form action={createReplyAction} className="mt-2 space-y-2">
              <input type="hidden" name="topic_id" value={topicId} />
              <input type="hidden" name="parent_id" value={reply.id} />
              <textarea
                name="body"
                rows={3}
                required
                className="w-full rounded-lg border border-white/10 bg-zinc-950/70 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
                placeholder="پاسخت رو بنویس..."
              />
              <button
                type="submit"
                className="rounded-lg bg-purple-500 px-3 py-1.5 text-xs text-white transition-all duration-200 hover:bg-purple-600 active:scale-[0.98]"
              >
                ارسال پاسخ
              </button>
            </form>
          </details>
          </div>
        </article>
      </ReplyCardLink>

      {children.length > 0 ? (
        <ul>
          {children.map((child) => (
            <ReplyNode
              key={child.id}
              reply={child}
              allReplies={allReplies}
              topicId={topicId}
              canSelectBest={canSelectBest}
              depth={depth + 1}
              isBest={false}
              viewerReactions={viewerReactions}
              viewerId={viewerId}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function ReplyTree({ topicId, replies, bestReplyId, canSelectBest, viewerReactions, viewerId }: ReplyTreeProps) {
  const topLevel = replies.filter((reply) => !reply.parentId).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const sortedTopLevel = topLevel.sort((a, b) => {
    if (bestReplyId && a.id === bestReplyId) return -1;
    if (bestReplyId && b.id === bestReplyId) return 1;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return (
    <section className="mt-6">
      <h2 className="text-xl font-bold text-zinc-50">پاسخ‌ها</h2>

      {sortedTopLevel.length === 0 ? (
        <EmptyState
          icon={MessageCirclePlus}
          title="هنوز کسی اینجا نیومده. تو اولی باش."
          actionHref={`/t/${topicId}#reply-form`}
          actionLabel="نوشتن اولین پاسخ"
        />
      ) : (
        <ul>
          {sortedTopLevel.map((reply) => (
            <ReplyNode
              key={reply.id}
              reply={reply}
              allReplies={replies}
              topicId={topicId}
              canSelectBest={canSelectBest}
              depth={0}
              isBest={bestReplyId === reply.id}
              viewerReactions={viewerReactions}
              viewerId={viewerId}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
