import Link from "next/link";
import { CategoryNav } from "@/components/topic/category-nav";
import { TopicFeed } from "@/components/topic/topic-feed";
import { formatRelative } from "@/lib/jalali";
import { getOrderedCategories, getTopicsFeed } from "@/lib/forum-data";

type HomePageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const selectedTab = params.tab === "new" || params.tab === "following" ? params.tab : "hot";

  const [categoryItems, topics] = await Promise.all([
    getOrderedCategories(),
    selectedTab === "following" ? Promise.resolve([]) : getTopicsFeed(selectedTab === "new" ? "new" : "hot"),
  ]);

  const mappedTopics = topics.map((topic) => ({
    ...topic,
    createdAtLabel: formatRelative(topic.createdAt),
  }));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <section className="rounded-3xl border border-[var(--border)] bg-[color:var(--surface)]/80 p-6">
        <h1 className="text-2xl font-bold text-zinc-50">بحث‌های امروز آفگرید</h1>
        <p className="mt-2 text-sm text-zinc-400">جایی برای گفت‌وگوهای عمیق، بی‌حواس‌پرتی و بی‌فید بی‌پایان.</p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            href="/?tab=hot"
            className={`rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
              selectedTab === "hot"
                ? "bg-purple-500 text-white"
                : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            داغ
          </Link>
          <Link
            href="/?tab=new"
            className={`rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
              selectedTab === "new"
                ? "bg-purple-500 text-white"
                : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            جدید
          </Link>
          <Link
            href="/?tab=following"
            className={`rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
              selectedTab === "following"
                ? "bg-purple-500 text-white"
                : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            دنبال‌شده‌ها
          </Link>
        </div>
      </section>

      <CategoryNav items={categoryItems} />

      {selectedTab === "following" ? (
        <section className="mt-4 rounded-2xl border border-dashed border-white/15 bg-[color:var(--surface)]/50 p-10 text-center">
          <p className="text-lg font-semibold text-zinc-100">فید دنبال‌شده‌ها به‌زودی فعال می‌شود</p>
          <p className="mt-2 text-sm text-zinc-400">در فاز بعدی، تاپیک‌های کاربران و موضوعات دنبال‌شده اینجا نمایش داده می‌شود.</p>
        </section>
      ) : (
        <TopicFeed topics={mappedTopics} />
      )}
    </main>
  );
}
