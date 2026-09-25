import Image from "next/image";
import Link from "next/link";
import { Briefcase, CalendarDays, MapPin } from "lucide-react";
import type { TopicAuthor } from "@/lib/forum-data";
import { RoleBadge } from "@/components/user/role-badge";
import { formatJalali, formatRelative } from "@/lib/jalali";

/** رنگ نوار ظریف بالای کارت — به رنگ نقش نویسنده */
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
 * کارت کامل نویسنده‌ی تاپیک — آواتار بزرگ، نام، بج نقش، شهر/شغل و تاریخ عضویت.
 * کل کارت به پروفایل کاربر لینک می‌شود و تاریخ انتشار تاپیک بالای کارت است.
 */
export function TopicAuthorCard({ author, topicCreatedAt }: TopicAuthorCardProps) {
  if (!author) {
    return (
      <div className="mt-6">
        <div className="mt-2 rounded-2xl border border-white/5 bg-zinc-900/50 p-5 text-sm text-zinc-500">نویسنده‌ی مهمان</div>
      </div>
    );
  }

  const displayName = author.displayName || author.username;
  const accent = ROLE_ACCENT[author.role] ?? "#52525B"; // کاربر عادی: خاکستری ظریف

  return (
    <div className="mt-6">
      <p className="text-xs text-zinc-500">منتشر شده {formatRelative(topicCreatedAt)}</p>

      <Link
        href={`/u/${author.username}`}
        className="group/author mt-1.5 block overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/50 transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-400/40 hover:shadow-[0_0_28px_-10px_rgba(168,85,247,0.55)]"
      >
        {/* نوار رنگی نقش */}
        <div aria-hidden="true" className="h-0.5 w-full" style={{ backgroundColor: accent }} />

        <div className="flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:items-center sm:text-start">
          {/* آواتار — ۸۰px دسکتاپ، ۶۰px موبایل */}
          <span className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-full border border-white/10 bg-purple-500/20 sm:h-20 sm:w-20">
            {author.avatarUrl ? (
              <Image src={author.avatarUrl} alt={displayName} fill className="object-cover" sizes="(min-width: 640px) 80px, 60px" />
            ) : (
              <span className="grid h-full w-full place-items-center text-xl font-bold text-purple-200">
                {displayName.trim().charAt(0)}
              </span>
            )}
          </span>

          <span className="min-w-0">
            <span className="block text-lg font-bold text-zinc-50 transition-colors group-hover/author:text-purple-200">
              {displayName}
            </span>
            <span className="mt-0.5 block text-sm text-zinc-500">@{author.username}</span>

            <span className="mt-2 block">
              <RoleBadge role={author.role} size="md" />
            </span>

            {author.city || author.job ? (
              <span className="mt-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-400 sm:justify-start">
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

            <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-zinc-500">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              عضو از {formatJalali(author.createdAt)}
            </span>
          </span>
        </div>
      </Link>
    </div>
  );
}
