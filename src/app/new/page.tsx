import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrderedCategories } from "@/lib/forum-data";
import { NewTopicForm } from "@/components/topic/new-topic-form";

type NewTopicPageProps = {
  searchParams: Promise<{ category?: string; error?: string }>;
};

export default async function NewTopicPage({ searchParams }: NewTopicPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const emailConfirmedAt = (user as { email_confirmed_at?: string | null }).email_confirmed_at;

  if (!emailConfirmedAt) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6">
          <h1 className="text-2xl font-bold text-amber-200">ایمیلت رو تأیید کن</h1>
          <p className="mt-2 text-sm text-amber-100">
            برای ساخت تاپیک جدید، اول باید ایمیلت تأیید شده باشه. بعد از تأیید، همین صفحه فرم کامل ایجاد تاپیک رو نشون می‌ده.
          </p>
          <Link
            href={`/verify-email?email=${encodeURIComponent(user.email ?? "")}`}
            className="mt-4 inline-flex h-10 items-center rounded-xl bg-amber-500 px-4 text-sm font-semibold text-zinc-950 transition-all hover:bg-amber-400"
          >
            رفتن به صفحه تأیید ایمیل
          </Link>
        </section>
      </main>
    );
  }

  const categories = await getOrderedCategories();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <h1 className="text-2xl font-bold text-zinc-50">ایجاد تاپیک جدید</h1>
        <p className="mt-2 text-sm text-zinc-400">برای شروع یک بحث عمیق، جزئیات کافی بنویس تا پاسخ‌های بهتری بگیری.</p>

        {params.error ? <p className="mt-4 rounded-xl bg-red-500/15 p-3 text-sm text-red-300">{params.error}</p> : null}

        <NewTopicForm categories={categories} defaultCategorySlug={params.category} />
      </section>
    </main>
  );
}
