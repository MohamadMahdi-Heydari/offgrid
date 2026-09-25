import Image from "next/image";
import Link from "next/link";
import { Briefcase, CalendarDays, Clock3, MapPin } from "lucide-react";
import type { TopicAuthor } from "@/lib/forum-data";
import { RoleBadge } from "@/components/user/role-badge";
import { formatJalali, formatRelative } from "@/lib/jalali";

/** رنگ نوار عمودی نقش — سمت start کارت (در RTL یعنی لبه‌ی راست) */
const ROLE_ACCENT: Record<string, string> = {
  moderator: "#EF4444",
  admin: "#F97316",
  legend: "#3B82F6",
};

type TopicAuthorCardProps = {
  author: TopicAuthor | null;
  topicCreatedAt: Date;
};

/**
 * کارت نویسنده‌ی تاپیک به سبک انجمن‌های کلاسیک:
 * - دسکتاپ: ستون عمودی (w-52) کنار محتوا با نوار رنگی نقش، آواتار ۸۰px و جزئیات کامل
 * - موبایل: نوار افقی فشرده (آواتار ۴۰px + نام + بج + زمان) بالای محتوا
 * کل کارت به پروفایل لینک است و hover آن glow بنفش دارد.
 */
export function TopicAuthorCard({ author, topicCreatedAt }: TopicAuthorCardProps) {
  if (!author) {
    return (
      <div className="shrink-0 rounded-2xl border border-white/5 bg-zinc-900/50 p-3 text-xs text-zinc-500 md:w-52 md:p-5">
        نویسنده‌ی مهمان
      </div>
    );
  }

  const displayName = author.displayName || author.username;
  const accent = ROLE_ACCENT[author.role] ?? "#52525B";

  return (
    <Link
      href={`/u/${author.username}`}
      className="group/author block shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/50 transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-400/40 hover:shadow-[0_0_28px_-10px_rgba(168,85,247,0.55)] md:h-full md:w-52"
    >
      <span className="flex h-full">
        {/* نوار عمودی رنگ نقش — اولین فرزند flex، پس در RTL سمت start (راست) می‌نشیند */}
        <span aria-hidden="true" className="hidden w-1 shrink-0 md:block" style={{ backgroundColor: accent }} />

        {/* ——— نسخه‌ی موبایل: نوار افقی فشرده بالای محتوا ——— */}
        <span className="flex flex-1 items-center gap-3 p-3 md:hidden">
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-purple-500/20">
            {author.avatarUrl ? (
              <Image src={author.avatarUrl} alt={displayName} fill className="object-cover" sizes="40px" />
            ) : (
              <span className="grid h-full w-full place-items-center text-sm font-bold text-purple-200">
                {displayName.trim().charAt(0)}
              </span>
            )}
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-bold text-zinc-50 transition-colors group-hover/author:text-purple-200">
                {displayName}
              </span>
              <RoleBadge role={author.role} size="sm" />
            </span>
            <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-zinc-500">
              <Clock3 className="h-3 w-3" aria-hidden="true" />
              {formatRelative(topicCreatedAt)}
            </span>
          </span>
        </span>

        {/* ——— نسخه‌ی دسکتاپ: ستون عمودی کامل ——— */}
        <span className="hidden flex-1 flex-col items-center gap-1.5 p-4 text-center md:flex">
          <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/10 bg-purple-500/20">
            {author.avatarUrl ? (
              <Image src={author.avatarUrl} alt={displayName} fill className="object-cover" sizes="80px" />
            ) : (
              <span className="grid h-full w-full place-items-center text-xl font-bold text-purple-200">
                {displayName.trim().charAt(0)}
              </span>
            )}
          </span>

          <span className="mt-1 text-base font-bold text-zinc-50 transition-colors group-hover/author:text-purple-200">
            {displayName}
          </span>
          <RoleBadge role={author.role} size="md" />
          <span className="text-xs text-zinc-500">@{author.username}</span>

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

          {/* تاریخ انتشار تاپیک — چسبیده به کف ستون تا با هر ارتفاع محتوایی منظم بماند */}
          <span className="mt-auto inline-flex items-center gap-1 pt-2 text-[11px] text-zinc-500">
            <Clock3 className="h-3 w-3" aria-hidden="true" />
            منتشر شده {formatRelative(topicCreatedAt)}
          </span>
        </span>
      </span>
    </Link>
  );
}
