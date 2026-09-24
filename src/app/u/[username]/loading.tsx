import { TopicFeedSkeleton } from "@/components/topic/topic-feed-skeleton";

export default function UserProfileLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      {/* کارت پروفایل */}
      <div className="animate-pulse rounded-2xl border border-[var(--border)] bg-zinc-900/50 p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full border border-[var(--border)] bg-zinc-800" />
          <div>
            <div className="h-6 w-40 rounded bg-zinc-800" />
            <div className="mt-2 h-3 w-24 rounded bg-zinc-800/70" />
            <div className="mt-2 h-3 w-56 rounded bg-zinc-800/60" />
          </div>
        </div>
        <div className="mt-4 flex gap-4">
          <div className="h-3 w-16 rounded bg-zinc-800/60" />
          <div className="h-3 w-20 rounded bg-zinc-800/60" />
          <div className="h-3 w-24 rounded bg-zinc-800/60" />
        </div>
      </div>

      {/* آسمان شخصی */}
      <div className="mt-6 animate-pulse rounded-2xl border border-[var(--border)] bg-gradient-to-b from-purple-950/25 to-black p-4">
        <div className="h-6 w-32 rounded bg-zinc-800" />
        <div className="mt-4 h-[300px] rounded-xl border border-white/5 bg-black/30" />
      </div>

      {/* فید تاپیک‌ها */}
      <div className="mt-6 animate-pulse">
        <div className="h-6 w-32 rounded bg-zinc-800" />
      </div>
      <TopicFeedSkeleton count={2} />
    </main>
  );
}
