import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { OffgridLogo } from "@/components/brand/offgrid-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { getUnreadCountAction } from "@/app/actions/notifications";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/actions/auth";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("username,display_name,avatar_url").eq("id", user.id).maybeSingle()
    : { data: null };

  const emailConfirmedAt = (user as { email_confirmed_at?: string | null } | null)?.email_confirmed_at ?? null;
  const newTopicHref = !user ? "/login" : !emailConfirmedAt ? "/verify-email?notice=برای%20ساخت%20تاپیک%20ابتدا%20ایمیلت%20را%20تأیید%20کن" : "/new";
  const unreadCount = user ? await getUnreadCountAction() : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color:var(--background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
        <OffgridLogo />

        <label className="relative me-auto hidden w-full max-w-md items-center md:flex">
          <Search className="pointer-events-none absolute start-3 h-4 w-4 text-zinc-500" strokeWidth={1.5} />
          <input
            type="search"
            placeholder="جستجو در بحث‌ها..."
            aria-label="جستجو"
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pe-20 ps-10 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:ring-2 focus:ring-purple-500/60"
          />
          <kbd className="pointer-events-none absolute end-3 rounded-md border border-white/10 bg-zinc-900 px-1.5 py-0.5 text-[11px] text-zinc-400">
            ⌘K
          </kbd>
        </label>

        <Link
          href={newTopicHref}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-purple-500 px-3.5 text-sm font-medium text-white transition-all duration-200 hover:bg-purple-600 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" strokeWidth={1.8} />
          <span className="hidden sm:inline">تاپیک جدید</span>
        </Link>

        {user ? <NotificationBell initialUnreadCount={unreadCount} /> : null}

        <ThemeToggle />

        {!user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-zinc-200 transition-all hover:bg-white/10"
            >
              ورود
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center rounded-xl bg-purple-500 px-3 text-sm font-medium text-white transition-all hover:bg-purple-600"
            >
              ثبت‌نام
            </Link>
          </div>
        ) : (
          <details className="relative">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-white/10 bg-zinc-800 text-xs text-zinc-200 marker:content-none">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="آواتار" className="h-full w-full rounded-full object-cover" />
              ) : (
                (profile?.display_name ?? profile?.username ?? user.email ?? "?").slice(0, 1)
              )}
            </summary>

            <div className="absolute end-0 mt-2 w-52 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-2xl">
              <Link
                href={profile?.username ? `/u/${profile.username}` : "/settings/profile"}
                className="block rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
              >
                پروفایل من
              </Link>
              <Link href="/settings/profile" className="block rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-white/10">
                تنظیمات
              </Link>
              <Link href="/bookmarks" className="block rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-white/10">
                بوکمارک‌ها
              </Link>
              <Link href="/my-warnings" className="block rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-white/10">
                اخطارهای من
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="mt-1 block w-full rounded-lg px-3 py-2 text-start text-sm text-red-300 hover:bg-red-500/15"
                >
                  خروج
                </button>
              </form>
            </div>
          </details>
        )}
      </div>
    </header>
  );
}
