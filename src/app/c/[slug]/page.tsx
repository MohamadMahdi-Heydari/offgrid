import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryNav } from "@/components/topic/category-nav";
import { TopicFeed } from "@/components/topic/topic-feed";
import { formatRelative } from "@/lib/jalali";
import { getCategoryBySlug, getTopicsByCategory } from "@/lib/forum-data";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const [category, topics] = await Promise.all([getCategoryBySlug(slug), getTopicsByCategory(slug, 20)]);

  if (!category) {
    notFound();
  }

  const mappedTopics = topics.map((topic) => ({
    ...topic,
    createdAtLabel: formatRelative(topic.createdAt),
  }));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <section className="rounded-3xl border border-[var(--border)] bg-[color:var(--surface)]/80 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400">دسته</p>
            <h1 className="mt-1 text-3xl font-bold text-zinc-50">
              <span className="ms-2">{category.icon ?? "#"}</span>
              {category.name}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">{category.description ?? "هنوز توضیحی برای این دسته ثبت نشده است."}</p>
          </div>

          <Link
            href={`/new?category=${category.slug}`}
            className="inline-flex h-10 items-center rounded-xl bg-purple-500 px-4 text-sm font-medium text-white transition-all duration-200 hover:bg-purple-600 active:scale-[0.98]"
          >
            تاپیک جدید تو این دسته
          </Link>
        </div>
      </section>

      <CategoryNav activeSlug={slug} />
      <TopicFeed topics={mappedTopics} />
    </main>
  );
}
