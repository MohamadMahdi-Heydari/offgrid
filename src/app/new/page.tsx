import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NewTopicPage() {
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <h1 className="text-2xl font-bold text-zinc-50">ایجاد تاپیک جدید</h1>
        <p className="mt-2 text-sm text-zinc-400">برای شروع یک بحث عمیق، جزئیات کافی بنویس تا پاسخ‌های بهتری بگیری.</p>

        <form className="mt-6 space-y-5">
          <div>
            <p className="mb-2 text-sm text-zinc-300">نوع تاپیک</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-200">
                <input name="type" type="radio" defaultChecked className="me-2" /> بحث 💬
              </label>
              <label className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-200">
                <input name="type" type="radio" className="me-2" /> سوال 🎯
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300" htmlFor="title">
              عنوان
            </label>
            <input
              id="title"
              type="text"
              minLength={5}
              maxLength={150}
              className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
              placeholder="عنوان دقیق و روشن بنویس"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300" htmlFor="body">
              بدنه
            </label>
            <textarea
              id="body"
              rows={8}
              className="w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
              placeholder="اینجا موضوع را کامل توضیح بده..."
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-xl bg-purple-500 px-5 text-sm font-medium text-white transition-all duration-200 hover:bg-purple-600 active:scale-[0.98]"
          >
            ارسال تاپیک
          </button>
        </form>
      </section>
    </main>
  );
}
