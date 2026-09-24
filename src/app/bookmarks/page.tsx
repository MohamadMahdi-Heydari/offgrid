import { Bookmark } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function BookmarksPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <section className="rounded-2xl border border-[var(--border)] bg-[color:var(--surface)]/80 p-6">
        <h1 className="text-2xl font-bold text-zinc-50">بوکمارک‌ها</h1>
        <p className="mt-2 text-sm text-zinc-400">بحث‌هایی که برای بعد نگه‌شان داشته‌ای، اینجا جمع می‌شوند.</p>
      </section>

      <EmptyState
        icon={Bookmark}
        title="هنوز نشانی ثبت نکرده‌ای"
        description="از صفحه‌ی هر تاپیک می‌توانی آن را نشان کنی تا بعداً برگردی سراغش."
        actionHref="/"
        actionLabel="مرور بحث‌ها"
      />
    </main>
  );
}
