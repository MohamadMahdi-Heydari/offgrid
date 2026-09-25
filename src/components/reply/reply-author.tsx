import Image from "next/image";
import Link from "next/link";
import { RoleBadge } from "@/components/user/role-badge";
import { formatRelative } from "@/lib/jalali";

type ReplyAuthorProps = {
  author: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    role: string;
  };
  replyCreatedAt: Date;
  /** پاسخ متعلق به خودِ بیننده است — تمایز ظریف نشان می‌دهیم */
  isMe?: boolean;
};

/**
 * سطر ساده‌ی پاسخ‌دهنده: آواتار + نام + @نیم + بج نقش + زمان نسبی.
 * کلیک → پروفایل کاربر. (بدون شهر/شغل/تاریخ عضویت — آن‌ها فقط برای کارت نویسنده‌ی تاپیک‌اند)
 */
export function ReplyAuthor({ author, replyCreatedAt, isMe = false }: ReplyAuthorProps) {
  const displayName = author.displayName || author.username;

  return (
    <Link
      href={`/u/${author.username}`}
      data-reply-nolink
      className={`group/author mb-2 flex w-fit max-w-full items-center gap-2.5 rounded-xl border p-1.5 pe-3 transition-colors duration-200 ${
        isMe
          ? "border-purple-400/30 bg-purple-500/5 hover:border-purple-400/50"
          : "border-transparent bg-white/[0.03] hover:border-purple-400/30 hover:bg-white/5"
      }`}
    >
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
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-medium text-zinc-100 transition-colors group-hover/author:text-purple-200">
            {displayName}
          </span>
          <RoleBadge role={author.role} size="sm" />
          {isMe ? (
            <span className="rounded-full border border-purple-400/40 px-1.5 py-px text-[10px] text-purple-300">شما</span>
          ) : null}
        </span>
        <span className="block text-xs text-zinc-500">
          @{author.username} · {formatRelative(replyCreatedAt)}
        </span>
      </span>
    </Link>
  );
}
