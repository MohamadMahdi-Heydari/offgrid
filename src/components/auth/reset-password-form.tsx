"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("پسورد باید حداقل ۸ کاراکتر باشد");
      return;
    }

    if (password !== confirmPassword) {
      setError("تکرار پسورد با پسورد جدید یکسان نیست");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("تغییر پسورد انجام نشد. دوباره تلاش کن");
      setIsLoading(false);
      return;
    }

    setMessage("پسورد با موفقیت تغییر کرد. در حال انتقال به ورود...");
    setIsLoading(false);

    setTimeout(() => {
      router.replace("/login");
    }, 1200);
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      {error ? <p className="rounded-xl bg-red-500/15 p-3 text-sm text-red-300">{error}</p> : null}
      {message ? <p className="rounded-xl bg-emerald-500/15 p-3 text-sm text-emerald-300">{message}</p> : null}

      <div>
        <label className="mb-1 block text-sm text-zinc-300" htmlFor="password">
          پسورد جدید
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-300" htmlFor="confirmPassword">
          تأیید پسورد جدید
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          minLength={8}
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-purple-500 text-sm font-semibold text-white transition-all hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "در حال ذخیره..." : "ذخیره پسورد جدید"}
      </button>
    </form>
  );
}
