export default function CategoryLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="h-36 animate-pulse rounded-3xl border border-[var(--border)] bg-zinc-900/50" />
      <div className="mt-4 h-10 animate-pulse rounded-xl border border-[var(--border)] bg-zinc-900/40" />
      <div className="mt-4 h-44 animate-pulse rounded-2xl border border-[var(--border)] bg-zinc-900/40" />
    </main>
  );
}
