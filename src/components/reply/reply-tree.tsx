import { createReplyAction, selectBestReplyAction, toggleReactionAction } from "@/app/actions/forum";
import { renderMarkdown } from "@/lib/markdown";
import { formatRelative } from "@/lib/jalali";
import type { ReplyItem } from "@/lib/forum-data";
import { getRoleEmoji } from "@/lib/forum-data";

type ReplyTreeProps = {
  topicId: string;
  replies: ReplyItem[];
  bestReplyId: string | null;
  canSelectBest: boolean;
};

function ReplyNode({
  reply,
  replies,
  topicId,
  canSelectBest,
  isBest,
}: {
  reply: ReplyItem;
  replies: ReplyItem[];
  topicId: string;
  canSelectBest: boolean;
  isBest: boolean;
}) {
  const children = replies.filter((item) => item.parentId === reply.id).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <li className="relative mt-4 border-s border-white/10 ps-4">
      <article className={`rounded-xl border ${isBest ? "border-emerald-400/40" : "border-white/10"} bg-zinc-900/60 p-4`}>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span>
            {getRoleEmoji(reply.authorRole)} @{reply.authorUsername}
          </span>
          <span>•</span>
          <span>{formatRelative(reply.createdAt)}</span>
        </div>

        <div className="text-sm leading-relaxed text-zinc-200" dangerouslySetInnerHTML={{ __html: renderMarkdown(reply.body) }} />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <form action={toggleReactionAction}>
            <input type="hidden" name="topic_id" value={topicId} />
            <input type="hidden" name="target_type" value="reply" />
            <input type="hidden" name="target_id" value={reply.id} />
            <input type="hidden" name="value" value="1" />
            <button type="submit" className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-200 hover:bg-white/10">
              👍 {reply.likeCount}
            </button>
          </form>

          <form action={toggleReactionAction}>
            <input type="hidden" name="topic_id" value={topicId} />
            <input type="hidden" name="target_type" value="reply" />
            <input type="hidden" name="target_id" value={reply.id} />
            <input type="hidden" name="value" value="-1" />
            <button type="submit" className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-200 hover:bg-white/10">
              👎 {reply.dislikeCount}
            </button>
          </form>

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
              <button type="submit" className="rounded-lg bg-purple-500 px-3 py-1.5 text-xs text-white hover:bg-purple-600">
                ارسال پاسخ
              </button>
            </form>
          </details>
        </div>
      </article>

      {children.length > 0 ? (
        <ul>
          {children.map((child) => (
            <ReplyNode key={child.id} reply={child} replies={replies} topicId={topicId} canSelectBest={canSelectBest} isBest={false} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function ReplyTree({ topicId, replies, bestReplyId, canSelectBest }: ReplyTreeProps) {
  const topLevel = replies.filter((reply) => !reply.parentId).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const bestReply = bestReplyId ? replies.find((reply) => reply.id === bestReplyId) ?? null : null;

  const sortedTopLevel = bestReply ? [bestReply, ...topLevel.filter((reply) => reply.id !== bestReply.id)] : topLevel;

  return (
    <section className="mt-6">
      <h2 className="text-xl font-bold text-zinc-50">پاسخ‌ها</h2>

      {sortedTopLevel.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-white/15 bg-zinc-900/40 p-4 text-sm text-zinc-400">
          هنوز پاسخی ثبت نشده. اولین پاسخ را تو بنویس.
        </p>
      ) : (
        <ul>
          {sortedTopLevel.map((reply) => (
            <ReplyNode
              key={reply.id}
              reply={reply}
              replies={replies.filter((item) => item.id !== (bestReply?.id ?? ""))}
              topicId={topicId}
              canSelectBest={canSelectBest}
              isBest={bestReply?.id === reply.id}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
