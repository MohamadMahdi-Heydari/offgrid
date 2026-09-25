import Image from "next/image";
import Link from "next/link";
import { RoleBadge } from "@/components/user/role-badge";
import { formatRelative } from "@/lib/jalali";

const ROLE_BAR: Record<string, string> = {
  moderator: "bg-red-500/40",
  admin: "bg-orange-500/40",
  legend: "bg-blue-500/40",
};

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

  // هر دو واریانت، کارت مستقل خودشان هستند؛ پاسخِ بیننده تمایز بنفش ملایم دارد
  const toneCls = isMe
    ? "border-purple-400/40 bg-purple-500/10 hover:border-purple-400/60"
    : "border-white/10 bg-zinc-900/50 hover:border-purple-400/40 hover:bg-zinc-900/80";

  if (variant === "column") {
    return (
      <Link
        href={`/u/${author.username}`}
        data-reply-nolink
        className={`group/author flex h-full w-full flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all duration-200 ${toneCls}`}
        role="article"
      >
        <span
          className={`relative shrink-0 overflow-hidden rounded-full border border-white/10 bg-purple-500/20 ${
            depth <= 1 ? "h-10 w-10" : "h-8 w-8"
          }`}
        >
          {author.avatarUrl ? (
            <Image src={author.avatarUrl} alt={displayName} fill className="object-cover" sizes="40px" />
          ) : (
            <span className="grid h-full w-full place-items-center text-sm font-bold text-purple-200">{initial}</span>
          )}
        </span>

        <span className={`font-medium text-zinc-100 transition-colors group-hover/author:text-purple-200 ${depth <= 1 ? "text-sm" : "text-xs"}`}>
          {displayName}
        </span>
        <RoleBadge role={author.role} size="sm" />
        {isMe ? <span className="rounded-full border border-purple-400/40 bg-purple-500/20 px-1.5 py-px text-[10px] text-purple-200">شما</span> : null}
        <span className="text-[11px] text-zinc-500">@{author.username}</span>
        <span className="text-[11px] text-zinc-500">{formatRelative(replyCreatedAt)}</span>
      </Link>
    );
  }

  // نوار ظریف رنگ نقش — بقیه‌ی کارت‌ها هم همین الگو را دارند
  const accentBar = ROLE_BAR[author.role] ?? "bg-zinc-600/50";

  return (
    <Link
      href={`/u/${author.username}`}
      data-reply-nolink
      role="article"
      className={`group/author block w-full max-w-full overflow-hidden rounded-2xl border transition-all duration-200 ${toneCls}`}
    >
      <span className={`block h-0.5 w-full ${accentBar}`} aria-hidden="true" />

      <span className="flex items-center gap-2 p-2.5">
        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-purple-500/20">
          {author.avatarUrl ? (
            <Image src={author.avatarUrl} alt={displayName} fill className="object-cover" sizes="32px" />
          ) : (
            <span className="grid h-full w-full place-items-center text-xs font-bold text-purple-200">{initial}</span>
          )}
        </span>

        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="truncate text-sm font-medium text-zinc-100 transition-colors group-hover/author:text-purple-200">
            {displayName}
          </span>
          <RoleBadge role={author.role} size="sm" />
          {isMe ? <span className="rounded-full border border-purple-400/40 bg-purple-500/20 px-1.5 py-px text-[10px] text-purple-200">شما</span> : null}
          <span className="ms-auto text-xs text-zinc-500">{formatRelative(replyCreatedAt)}</span>
        </span>
      </span>
    </Link>
  );
}
