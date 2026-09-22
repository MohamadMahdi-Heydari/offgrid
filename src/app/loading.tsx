export default function RootLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="h-28 animate-pulse rounded-3xl border border-[var(--border)] bg-zinc-900/50" />
      <div className="mt-4 h-10 animate-pulse rounded-xl border border-[var(--border)] bg-zinc-900/40" />
      <div className="mt-4 space-y-4">
        <div className="h-40 animate-pulse rounded-2xl border border-[var(--border)] bg-zinc-900/40" />
        <div className="h-40 animate-pulse rounded-2xl border border-[var(--border)] bg-zinc-900/40" />
      </div>
    </main>
  );
}
