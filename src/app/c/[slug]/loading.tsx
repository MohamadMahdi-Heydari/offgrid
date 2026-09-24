import { CategoryNavSkeleton } from "@/components/topic/category-nav-skeleton";
import { TopicFeedSkeleton } from "@/components/topic/topic-feed-skeleton";

export default function CategoryLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="animate-pulse rounded-3xl border border-[var(--border)] bg-zinc-900/50 p-6">
        <div className="h-4 w-12 rounded bg-zinc-800/70" />
        <div className="mt-2 h-8 w-40 rounded bg-zinc-800" />
        <div className="mt-3 h-4 w-64 rounded bg-zinc-800/70" />
      </div>

      <CategoryNavSkeleton />
      <TopicFeedSkeleton count={3} />
    </main>
  );
}
