/**
 * اسکلت لودینگ با همان هندسه‌ی کارت واقعی TopicFeed:
 * ستون فانوس + عنوان/خطوط متن + ردیف تگ + ستون آمار سمت چپ.
 */
function TopicCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[var(--border)] bg-[color:var(--surface)]/70 p-6">
      <div className="flex gap-4">
        {/* ستون فانوس */}
        <div className="flex h-[92px] min-w-16 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-zinc-950/70 px-2 py-3">
          <div className="h-5 w-4 rounded-md bg-zinc-800" />
          <div className="h-3 w-6 rounded bg-zinc-800" />
          <div className="h-5 w-4 rounded-md bg-zinc-800" />
        </div>

        {/* بخش محتوا */}
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-3 w-16 rounded bg-zinc-800" />
            <div className="h-3 w-3 rounded-full bg-zinc-800/60" />
            <div className="h-3 w-20 rounded bg-zinc-800" />
            <div className="h-3 w-12 rounded bg-zinc-800/70" />
          </div>
          <div className="h-5 w-3/4 rounded bg-zinc-800" />
          <div className="mt-3 h-3 w-full rounded bg-zinc-800/80" />
          <div className="mt-2 h-3 w-2/3 rounded bg-zinc-800/80" />
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-14 rounded-full bg-zinc-800/70" />
            <div className="h-6 w-20 rounded-full bg-zinc-800/70" />
          </div>
        </div>

        {/* آمار سمت چپ */}
        <div className="flex min-w-20 flex-col items-end gap-3">
          <div className="h-4 w-10 rounded bg-zinc-800" />
          <div className="h-3 w-14 rounded bg-zinc-800/60" />
        </div>
      </div>
    </div>
  );
}

export function TopicFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="mt-4 space-y-4" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <TopicCardSkeleton key={index} />
      ))}
    </div>
  );
}
