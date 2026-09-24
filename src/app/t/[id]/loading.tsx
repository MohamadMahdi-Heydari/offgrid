export default function TopicLoading() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      {/* کارت تاپیک */}
      <div className="animate-pulse rounded-2xl border border-[var(--border)] bg-zinc-900/50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-3 w-20 rounded bg-zinc-800" />
          <div className="h-3 w-3 rounded-full bg-zinc-800/60" />
          <div className="h-3 w-16 rounded bg-zinc-800" />
          <div className="h-3 w-14 rounded bg-zinc-800/70" />
        </div>
        <div className="h-7 w-3/4 rounded bg-zinc-800" />
        <div className="mt-4 h-3 w-full rounded bg-zinc-800/80" />
        <div className="mt-2 h-3 w-full rounded bg-zinc-800/80" />
        <div className="mt-2 h-3 w-2/3 rounded bg-zinc-800/80" />
        <div className="mt-6 flex gap-2">
          <div className="h-11 w-24 rounded-xl bg-zinc-800/80" />
          <div className="h-11 w-24 rounded-xl bg-zinc-800/80" />
        </div>
        <div className="mt-3 h-3 w-16 rounded bg-zinc-800/60" />
      </div>

      {/* فرم پاسخ */}
      <div className="mt-6 animate-pulse rounded-2xl border border-[var(--border)] bg-zinc-900/40 p-4">
        <div className="h-5 w-24 rounded bg-zinc-800" />
        <div className="mt-4 h-24 rounded-xl bg-zinc-800/60" />
        <div className="mt-3 h-10 w-28 rounded-xl bg-zinc-800/80" />
      </div>

      {/* درخت پاسخ‌ها */}
      <div className="mt-6 animate-pulse">
        <div className="h-6 w-24 rounded bg-zinc-800" />
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-zinc-900/40 p-4">
          <div className="h-3 w-32 rounded bg-zinc-800/70" />
          <div className="mt-3 h-3 w-full rounded bg-zinc-800/60" />
          <div className="mt-2 h-3 w-1/2 rounded bg-zinc-800/60" />
          <div className="mt-4 flex gap-2">
            <div className="h-8 w-20 rounded-lg bg-zinc-800/70" />
            <div className="h-8 w-20 rounded-lg bg-zinc-800/70" />
          </div>
        </div>
      </div>
    </main>
  );
}
