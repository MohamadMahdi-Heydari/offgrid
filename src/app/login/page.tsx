import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-md items-center px-4 py-8">
      <section className="w-full rounded-2xl border border-[var(--border)] bg-[color:var(--surface)]/80 p-6">
        <h1 className="text-2xl font-bold text-zinc-50">ورود به آفگرید</h1>
        <p className="mt-2 text-sm text-zinc-400">ادامه بحث‌ها منتظرته.</p>

        {params.error ? <p className="mt-4 rounded-xl bg-red-500/15 p-3 text-sm text-red-300">{params.error}</p> : null}

        <form action={loginAction} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="email">
              ایمیل
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="password">
              پسورد
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
            />
          </div>

          <div className="text-sm">
            <Link href="/forgot-password" className="text-zinc-400 hover:text-purple-300">
              فراموشی رمز عبور
            </Link>
          </div>

          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-purple-500 text-sm font-semibold text-white transition-all hover:bg-purple-600"
          >
            ورود
          </button>
        </form>

        <p className="mt-4 text-sm text-zinc-400">
          هنوز عضو نیستی؟{" "}
          <Link href="/signup" className="text-purple-300 hover:text-purple-200">
            ثبت‌نام
          </Link>
        </p>
      </section>
    </main>
  );
}
