import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRepliesByTopic, getRoleEmoji, getTopicById } from "@/lib/forum-data";
import { renderMarkdown } from "@/lib/markdown";
import { formatRelative } from "@/lib/jalali";
import { createReplyAction, toggleReactionAction } from "@/app/actions/forum";
import { ReplyTree } from "@/components/reply/reply-tree";

type TopicPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export const revalidate = 30;

export default async function TopicPage({ params, searchParams }: TopicPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const supabase = await createClient();
  const [topic, replies, userResult] = await Promise.all([getTopicById(id), getRepliesByTopic(id), supabase.auth.getUser()]);

  if (!topic) {
    notFound();
  }

  const user = userResult.data.user;
  const canSelectBest = Boolean(user && topic.authorId === user.id && topic.type === "question");

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      {query.error ? <p className="mb-4 rounded-xl bg-red-500/15 p-3 text-sm text-red-300">{query.error}</p> : null}

      <article className="rounded-2xl border border-[var(--border)] bg-[color:var(--surface)]/80 p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <Link href={`/c/${topic.categorySlug}`} className="hover:text-purple-300">
            {topic.categoryName}
          </Link>
          <span>•</span>
          <span>
            {getRoleEmoji(topic.authorRole)} @{topic.authorUsername}
          </span>
          <span>•</span>
          <span>{formatRelative(topic.createdAt)}</span>
        </div>

        <h1 className="text-[28px] font-bold text-zinc-50">{topic.title}</h1>

        {topic.type === "question" && topic.questionContext ? (
          <p className="mt-3 rounded-xl border border-sky-400/30 bg-sky-500/10 p-3 text-sm text-sky-200">{topic.questionContext}</p>
        ) : null}

        <div className="mt-4 text-[15px] leading-relaxed text-zinc-200" dangerouslySetInnerHTML={{ __html: renderMarkdown(topic.body) }} />

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <form action={toggleReactionAction}>
            <input type="hidden" name="topic_id" value={topic.id} />
            <input type="hidden" name="target_type" value="topic" />
            <input type="hidden" name="target_id" value={topic.id} />
            <input type="hidden" name="value" value="1" />
            <button type="submit" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10">
              👍 {topic.likeCount}
            </button>
          </form>

          <form action={toggleReactionAction}>
            <input type="hidden" name="topic_id" value={topic.id} />
            <input type="hidden" name="target_type" value="topic" />
            <input type="hidden" name="target_id" value={topic.id} />
            <input type="hidden" name="value" value="-1" />
            <button type="submit" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10">
              👎 {topic.dislikeCount}
            </button>
          </form>

          <span className="text-xs text-zinc-400">{topic.replyCount} پاسخ</span>
        </div>
      </article>

      <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[color:var(--surface)]/70 p-4">
        <h2 className="text-lg font-semibold text-zinc-100">پاسخ جدید</h2>
        {!user ? (
          <p className="mt-2 text-sm text-zinc-400">
            برای ثبت پاسخ، <Link href="/login" className="text-purple-300">وارد شو</Link> یا عضو شو.
          </p>
        ) : (
          <form action={createReplyAction} className="mt-3 space-y-3">
            <input type="hidden" name="topic_id" value={topic.id} />
            <input type="hidden" name="parent_id" value="" />
            <textarea
              name="body"
              rows={4}
              required
              className="w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
              placeholder="پاسخت رو با Markdown بنویس..."
            />
            <button type="submit" className="inline-flex h-10 items-center rounded-xl bg-purple-500 px-4 text-sm font-medium text-white hover:bg-purple-600">
              ارسال پاسخ
            </button>
          </form>
        )}
      </section>

      <ReplyTree topicId={topic.id} replies={replies} bestReplyId={topic.bestReplyId} canSelectBest={canSelectBest} />
    </main>
  );
}
