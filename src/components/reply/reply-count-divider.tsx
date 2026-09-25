import { MessageCircle } from "lucide-react";

type ReplyCountDividerProps = {
  count: number;
};

/**
 * جداکننده‌ی زیبای بالای فرم پاسخ:
 * دو خط گرادیانت از طرفین + یک pill وسط با تعداد پاسخ‌های فعلی.
 */
export function ReplyCountDivider({ count }: ReplyCountDividerProps) {
  // رنگ بر اساس فعالیت بحث
  const pillTone =
    count === 0
      ? "border-white/10 bg-white/5 text-zinc-500"
      : count <= 5
        ? "border-white/10 bg-white/5 text-zinc-300"
        : "border-purple-400/30 bg-purple-500/10 text-purple-200";

  const label =
    count === 0
      ? "هنوز پاسخی نیست — تو اولی باش"
      : `${count.toLocaleString("fa-IR")} ${count === 1 ? "پاسخ تا اینجا" : "پاسخ تا اینجا"}`;

  return (
    <div className="my-6 flex items-center gap-3" role="separator" aria-hidden="true">
      {/* خط چپ (در RTL: سمت چپ بصری) */}
      <div className="h-px flex-1 bg-gradient-to-l from-white/20 to-transparent" />

      {/* Pill مرکزی */}
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${pillTone}`}
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        {label}
      </div>

      {/* خط راست (در RTL: سمت راست بصری) */}
      <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
    </div>
  );
}
