import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { categories, profiles, topics } from "@/db/schema";
import { formatJalali } from "@/lib/jalali";

type TopicPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function TopicPage({ params }: TopicPageProps) {
  const { id } = await params;

  let topic:
    | {
        id: string;
        title: string;
        body: string;
        createdAt: Date;
        categoryName: string | null;
        categorySlug: string | null;
        authorUsername: string | null;
      }
    | undefined;

  try {
    const result = await db
      .select({
        id: topics.id,
        title: topics.title,
        body: topics.body,
        createdAt: topics.createdAt,
        categoryName: categories.name,
        categorySlug: categories.slug,
        authorUsername: profiles.username,
      })
      .from(topics)
      .leftJoin(categories, eq(topics.categoryId, categories.id))
      .leftJoin(profiles, eq(topics.authorId, profiles.id))
      .where(eq(topics.id, id))
      .limit(1);

    topic = result[0];
  } catch {
    topic = undefined;
  }

  if (!topic) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <article className="rounded-2xl border border-[var(--border)] bg-[color:var(--surface)]/80 p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          {topic.categorySlug ? (
            <Link href={`/c/${topic.categorySlug}`} className="hover:text-purple-300">
              {topic.categoryName ?? "بدون دسته"}
            </Link>
          ) : (
            <span>{topic.categoryName ?? "بدون دسته"}</span>
          )}
          <span>•</span>
          <span>@{topic.authorUsername ?? "guest"}</span>
          <span>•</span>
          <span>{formatJalali(topic.createdAt)}</span>
        </div>

        <h1 className="text-[28px] font-bold text-zinc-50">{topic.title}</h1>
        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-200">{topic.body}</p>
      </article>
    </main>
  );
}
