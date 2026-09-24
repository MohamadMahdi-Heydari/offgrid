import Link from "next/link";
import { OffgridLantern } from "@/components/brand/offgrid-lantern";

/** ۴۰۴ — فانوس خاموش که آرام‌آرام، بار‌ها و بار‌ها نفس می‌کشد و روشن می‌شود. */
export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 py-16">
      <div className="relative text-center">
        {/* هاله‌ی نور دور فانوس */}
        <div
          aria-hidden="true"
          className="absolute -inset-x-20 -inset-y-16 rounded-full bg-purple-500/10 blur-3xl"
        />

        <div className="relative mx-auto flex w-fit items-end justify-center gap-6">
          <div className="text-purple-300/80">
            <OffgridLantern size={120} tone="purple" className="lantern-lit" />
          </div>
          {/* کمپفایر کنار فانوس */}
          <svg width="56" height="52" viewBox="0 0 56 52" aria-hidden="true" className="mb-1 text-purple-400/70">
            <path d="M28 12c-3 4.5-6.5 6.8-6.5 11a6.5 6.5 0 0 0 13 0C34.5 18.8 31 16.5 28 12Z" fill="#F59E0B" opacity="0.95" />
            <path d="M28 17.5c-1.8 2.6-3.8 4-3.8 6.5a3.8 3.8 0 0 0 7.6 0C31.8 21.5 29.8 20.1 28 17.5Z" fill="#FBBF24" />
            <path d="M16 40.5h24M19 47h18M22 40.5l-3.5 6M34 40.5l3.5 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="28" cy="44" r="3" fill="#A855F7" opacity="0.5" />
          </svg>
        </div>

        <h1 className="relative mt-8 text-6xl font-extrabold tracking-tight text-zinc-50">۴۰۴</h1>
        <p className="relative mt-3 text-xl font-semibold text-zinc-100">این مسیر آفگرید شده</p>
        <p className="relative mt-2 text-sm text-zinc-400">
          به نظر می‌رسد اینجا از شبکه جدا شده‌ای. مسیر را گم کردی؟
        </p>

        <Link
          href="/"
          className="relative mt-6 inline-flex h-11 items-center rounded-xl bg-purple-500 px-5 text-sm font-medium text-white transition-all duration-200 hover:bg-purple-600 hover:shadow-[0_0_24px_-6px_rgba(168,85,247,0.6)] active:scale-[0.98]"
        >
          برگرد به کمپفایر
        </Link>
      </div>
    </main>
  );
}
