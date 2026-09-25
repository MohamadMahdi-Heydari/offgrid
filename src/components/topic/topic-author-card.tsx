import Image from "next/image";
import Link from "next/link";
import { Briefcase, CalendarDays, Clock3, MapPin } from "lucide-react";
import type { TopicAuthor } from "@/lib/forum-data";
import { RoleBadge } from "@/components/user/role-badge";
import { formatJalali, formatRelative } from "@/lib/jalali";

/** نوار رنگی h-1 بالای کارت نویسنده — به رنگ نقش */
const ROLE_BAR: Record<string, string> = {
  moderator: "bg-red-500",
  admin: "bg-orange-500",
  legend: "bg-blue-500",
};

type TopicAuthorCardProps = {
  author: TopicAuthor | null;
  topicCreatedAt: Date;
  /**
   * strip: نوار افقی فشرده (نام + @ + بج) برای fallback صفحه‌ی باریک
   * column: جعبه‌ی عمودی کامل (آواتار ۸۰px + جزئیات) — همون که در حالت بیرونزدگی کنار تاپیک می‌نشیند
   */
  variant?: "strip" | "column";
};

/**
 * جعبه‌ی مستقل نویسنده‌ی تاپیک — border/bg خودش، نوار رنگی نقش در بالا.
 * کل کارت به پروفایل لینک است با glow بنفش روی hover.
 */
export function TopicAuthorCard({ author, topicCreatedAt, variant = "strip" }: TopicAuthorCardProps) {
  if (!author) {
    return (
      <div className="w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50">
        <div className="h-1 w-full bg-zinc-600" aria-hidden="true" />
        <p className="p-3 text-xs text-zinc-500">نویسنده‌ی مهمان</p>
      </div>
    );
  }

  const displayName = author.displayName || author.username;
  const accentBar = ROLE_BAR[author.role] ?? "bg-zinc-600";
  const initial = displayName.trim().charAt(0);

  return (
    <Link
      href={`/u/${author.username}`}
      className="group/author block w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-400/40 hover:shadow-[0_0_28px_-10px_rgba(168,85,247,0.55)]"
    >
      {/* نوار رنگی نقش — بالای همین جعبه‌ی مستقل */}
      <span className={`block h-1 w-full ${accentBar}`} aria-hidden="true" />

      {variant === "column" ? (
        <span className="flex flex-col items-center gap-1.5 p-4 text-center">
          <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/10 bg-purple-500/20">
            {author.avatarUrl ? (
              <Image src={author.avatarUrl} alt={displayName} fill className="object-cover" sizes="80px" />
            ) : (
              <span className="grid h-full w-full place-items-center text-xl font-bold text-purple-200">{initial}</span>
            )}
          </span>

          <span className="mt-1 text-base font-bold text-zinc-50 transition-colors group-hover/author:text-purple-200">
            {displayName}
          </span>
          <span className="text-xs text-zinc-500">@{author.username}</span>
          <RoleBadge role={author.role} size="md" />

          {author.city || author.job ? (
            <span className="mt-1 flex flex-col items-center gap-1 text-xs text-zinc-400">
              {author.city ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                  {author.city}
                </span>
              ) : null}
              {author.job ? (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                  {author.job}
                </span>
              ) : null}
            </span>
          ) : null}

          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            عضو از {formatJalali(author.createdAt)}
          </span>

          <span className="mt-auto inline-flex items-center gap-1 pt-2 text-[11px] text-zinc-500">
            <Clock3 className="h-3 w-3" aria-hidden="true" />
            منتشر شده {formatRelative(topicCreatedAt)}
          </span>
        </span>
      ) : (
        <span className="flex items-center gap-3 p-3">
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-purple-500/20">
            {author.avatarUrl ? (
              <Image src={author.avatarUrl} alt={displayName} fill className="object-cover" sizes="40px" />
            ) : (
              <span className="grid h-full w-full place-items-center text-sm font-bold text-purple-200">{initial}</span>
            )}
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-bold text-zinc-50 transition-colors group-hover/author:text-purple-200">
                {displayName}
              </span>
              <RoleBadge role={author.role} size="sm" />
            </span>
            <span className="mt-0.5 block text-xs text-zinc-500">@{author.username}</span>
          </span>
        </span>
      )}
    </Link>
  );
}
