import { resendVerificationAction } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

type VerifyEmailPageProps = {
  searchParams: Promise<{ email?: string; resent?: string; error?: string; notice?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = params.email ?? user?.email ?? "";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-xl items-center px-4 py-8">
      <section className="w-full rounded-2xl border border-[var(--border)] bg-[color:var(--surface)]/80 p-6">
        <h1 className="text-2xl font-bold text-zinc-50">ایمیلت رو چک کن</h1>
        <p className="mt-2 text-sm text-zinc-300">برای فعال‌سازی حساب، روی لینک تأیید ایمیل کلیک کن.</p>
        {email ? <p className="mt-2 text-sm text-zinc-400">ایمیل: {email}</p> : null}

        {params.notice ? <p className="mt-4 rounded-xl bg-amber-500/15 p-3 text-sm text-amber-300">{params.notice}</p> : null}
        {params.resent ? <p className="mt-4 rounded-xl bg-emerald-500/15 p-3 text-sm text-emerald-300">ایمیل تأیید دوباره ارسال شد.</p> : null}
        {params.error ? <p className="mt-4 rounded-xl bg-red-500/15 p-3 text-sm text-red-300">{params.error}</p> : null}

        <form action={resendVerificationAction} className="mt-5">
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            disabled={!email}
            className="inline-flex h-11 items-center rounded-xl bg-purple-500 px-4 text-sm font-semibold text-white transition-all hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ارسال مجدد ایمیل تأیید
          </button>
        </form>
      </section>
    </main>
  );
}
