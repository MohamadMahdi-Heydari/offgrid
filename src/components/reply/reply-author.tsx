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
  /** پاسخ متعلق به خودِ بیننده است — تمایز ظریف بنفش نشان می‌دهیم */
  isMe?: boolean;
  /** عمق پاسخ تودرتو — برای کوچک‌تر شدن آواتار در عمق */
  depth?: number;
  /** strip: نوار افقی فشرده · column: ستون عمودی centre-چین */
  variant?: "strip" | "column";
};

/**
 * سطر/ستون نویسنده‌ی پاسخ.
 * - strip: آواتار + نام + بج + زمان نسبی در یک ردیف باریک (موبایل و پاسخ‌های عمیق)
 * - column: آواتار بالا، نام، بج، @نیم و زمان زیر هم (ستون دسکتاپ)
 * کلیک → پروفایل کاربر؛ با data-reply-nolink از ناوبری انکر کارت جدا می‌شود.
 */
export function ReplyAuthor({ author, replyCreatedAt, isMe = false, depth = 0, variant = "strip" }: ReplyAuthorProps) {
  const displayName = author.displayName || author.username;
  const initial = displayName.trim().charAt(0);

  const toneCls = isMe
    ? "border-purple-400/30 bg-purple-500/5 hover:border-purple-400/50"
    : "border-transparent bg-white/[0.03] hover:border-purple-400/30 hover:bg-white/5";

  if (variant === "column") {
    return (
      <Link
        href={`/u/${author.username}`}
        data-reply-nolink
        className={`group/author flex w-full flex-col items-center gap-1 rounded-xl border p-2 text-center transition-colors duration-200 ${toneCls}`}
      >
        <span
          className={`relative shrink-0 overflow-hidden rounded-full border border-white/10 bg-purple-500/20 ${
            depth === 0 ? "h-10 w-10" : "h-8 w-8"
          }`}
        >
          {author.avatarUrl ? (
            <Image src={author.avatarUrl} alt={displayName} fill className="object-cover" sizes="40px" />
          ) : (
            <span className="grid h-full w-full place-items-center text-sm font-bold text-purple-200">{initial}</span>
          )}
        </span>

        <span className={`font-medium text-zinc-100 transition-colors group-hover/author:text-purple-200 ${depth === 0 ? "text-sm" : "text-xs"}`}>
          {displayName}
        </span>
        <RoleBadge role={author.role} size="sm" />
        {isMe ? <span className="rounded-full border border-purple-400/40 px-1.5 py-px text-[10px] text-purple-300">شما</span> : null}
        <span className="text-[11px] text-zinc-500">@{author.username}</span>
        <span className="text-[11px] text-zinc-500">{formatRelative(replyCreatedAt)}</span>
      </Link>
    );
  }

  return (
    <Link
      href={`/u/${author.username}`}
      data-reply-nolink
      className={`group/author mb-2 flex w-fit max-w-full items-center gap-2 rounded-xl border p-1.5 pe-3 transition-colors duration-200 ${toneCls}`}
    >
      <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-purple-500/20">
        {author.avatarUrl ? (
          <Image src={author.avatarUrl} alt={displayName} fill className="object-cover" sizes="32px" />
        ) : (
          <span className="grid h-full w-full place-items-center text-xs font-bold text-purple-200">{initial}</span>
        )}
      </span>

      <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="truncate text-sm font-medium text-zinc-100 transition-colors group-hover/author:text-purple-200">
          {displayName}
        </span>
        <RoleBadge role={author.role} size="sm" />
        {isMe ? <span className="rounded-full border border-purple-400/40 px-1.5 py-px text-[10px] text-purple-300">شما</span> : null}
        <span className="text-xs text-zinc-500">{formatRelative(replyCreatedAt)}</span>
      </span>
    </Link>
  );
}
