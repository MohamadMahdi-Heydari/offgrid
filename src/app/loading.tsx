import { CategoryNavSkeleton } from "@/components/topic/category-nav-skeleton";
import { TopicFeedSkeleton } from "@/components/topic/topic-feed-skeleton";

export default function RootLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="animate-pulse rounded-3xl border border-[var(--border)] bg-zinc-900/50 p-6">
        <div className="h-7 w-48 rounded bg-zinc-800" />
        <div className="mt-3 h-4 w-72 rounded bg-zinc-800/70" />
        <div className="mt-5 flex gap-2">
          <div className="h-10 w-16 rounded-xl bg-zinc-800" />
          <div className="h-10 w-16 rounded-xl bg-zinc-800/70" />
          <div className="h-10 w-24 rounded-xl bg-zinc-800/70" />
        </div>
      </div>

      <CategoryNavSkeleton />
      <TopicFeedSkeleton count={3} />
    </main>
  );
}
