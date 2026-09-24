import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  /** پیام اصلی؛ اگر children پاس داده شود، عنوان همین رشته است */
  title: string;
  /** توضیح دوم (اختیاری) */
  description?: string;
  /** دکمه‌ی اقدام (اختیاری) */
  actionHref?: string;
  actionLabel?: string;
  /** اگر رشته باشد همان نمایش داده می‌شود */
  children?: React.ReactNode;
};

export function EmptyState({ icon: Icon, title, description, actionHref, actionLabel, children }: EmptyStateProps) {
  return (
    <section className="mt-4 rounded-2xl border border-dashed border-white/15 bg-[color:var(--surface)]/50 p-10 text-center">
      {children ?? (
        <>
          <Icon className="mx-auto h-8 w-8 text-purple-300/70" aria-hidden="true" />
          <p className="mt-3 text-lg font-semibold text-zinc-100">{title}</p>
          {description ? <p className="mt-2 text-sm text-zinc-400">{description}</p> : null}
        </>
      )}

      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex h-10 items-center rounded-xl bg-purple-500 px-4 text-sm font-medium text-white transition-all duration-200 hover:bg-purple-600 active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
