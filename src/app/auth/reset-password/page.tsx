import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-md items-center px-4 py-8">
      <section className="w-full rounded-2xl border border-[var(--border)] bg-[color:var(--surface)]/80 p-6">
        <h1 className="text-2xl font-bold text-zinc-50">تنظیم پسورد جدید</h1>
        <p className="mt-2 text-sm text-zinc-400">پسورد جدیدت رو وارد کن تا دسترسی حسابت بازیابی بشه.</p>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
