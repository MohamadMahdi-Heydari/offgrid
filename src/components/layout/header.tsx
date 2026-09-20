import Link from "next/link";
import { Bell, Plus, Search } from "lucide-react";
import { OffgridLogo } from "@/components/brand/offgrid-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Header() {
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
          href="/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-purple-500 px-3.5 text-sm font-medium text-white transition-all duration-200 hover:bg-purple-600 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" strokeWidth={1.8} />
          <span className="hidden sm:inline">تاپیک جدید</span>
        </Link>

        <button
          type="button"
          aria-label="اعلان‌ها (به‌زودی)"
          title="به‌زودی"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
        >
          <Bell className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
