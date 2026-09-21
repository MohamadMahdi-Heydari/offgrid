import Link from "next/link";
import { signupAction } from "@/app/actions/auth";

type SignupPageProps = {
  searchParams: Promise<{ error?: string; email?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-md items-center px-4 py-8">
      <section className="w-full rounded-2xl border border-[var(--border)] bg-[color:var(--surface)]/80 p-6">
        <h1 className="text-2xl font-bold text-zinc-50">ثبت‌نام در آفگرید</h1>
        <p className="mt-2 text-sm text-zinc-400">به انجمن بحث‌محور فارسی خوش اومدی.</p>

        {params.error ? <p className="mt-4 rounded-xl bg-red-500/15 p-3 text-sm text-red-300">{params.error}</p> : null}

        <form action={signupAction} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="email">
              ایمیل
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={params.email ?? ""}
              required
              className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="username">
              یوزرنیم
            </label>
            <input
              id="username"
              name="username"
              type="text"
              pattern="^[a-zA-Z0-9_.-]+$"
              required
              className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
            />
            <p className="mt-1 text-xs text-zinc-500">فقط حروف انگلیسی، عدد و ._- مجاز است.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="password">
              پسورد
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-purple-500 text-sm font-semibold text-white transition-all hover:bg-purple-600"
          >
            ساخت حساب
          </button>
        </form>

        <p className="mt-4 text-sm text-zinc-400">
          حساب داری؟{" "}
          <Link href="/login" className="text-purple-300 hover:text-purple-200">
            وارد شو
          </Link>
        </p>
      </section>
    </main>
  );
}
