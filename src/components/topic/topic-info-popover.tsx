"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { formatJalaliDateTime } from "@/lib/jalali";

export type TopicInfo = {
  authorDisplayName: string;
  authorUsername: string;
  categoryName: string;
  createdAt: string;
  /** null یعنی هنوز ویرایشی ثبت نشده — نمایش «بدون ویرایش» */
  updatedAt: string | null;
  editCount: number;
  tagCount: number;
  bodyCharacterCount: number;
};

type TopicInfoPopoverProps = {
  info: TopicInfo;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-xs text-zinc-500">{label}</dt>
      <dd className="min-w-0 truncate text-xs font-medium text-zinc-200">{value}</dd>
    </div>
  );
}

/**
 * آیکون (i) گوشه‌ی متن تاپیک — پاپ‌اور اطلاعات عمومی.
 * فقط داده‌ی عمومی: نویسنده، دسته، تاریخ‌ها، شمار کاراکتر و تگ.
 */
export function TopicInfoPopover({ info }: TopicInfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onDocumentDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocumentDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocumentDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const editedLabel = info.updatedAt
    ? `${formatJalaliDateTime(info.updatedAt)}${info.editCount > 0 ? ` (${info.editCount} ویرایش)` : ""}`
    : "بدون ویرایش";

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="اطلاعات تاپیک"
        title="اطلاعات تاپیک"
        className="mt-1 grid h-6 w-6 place-items-center rounded-full border border-white/10 text-zinc-500 transition-colors duration-200 hover:border-purple-400/40 hover:text-purple-300"
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="اطلاعات تاپیک"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute start-0 top-8 z-40 w-64 rounded-xl border border-white/10 bg-zinc-900/95 p-4 shadow-xl shadow-black/50 backdrop-blur-sm"
          >
            <h3 className="mb-3 border-b border-white/10 pb-2 text-sm font-semibold text-zinc-100">اطلاعات تاپیک</h3>
            <dl className="space-y-2.5">
              <InfoRow label="نویسنده" value={`${info.authorDisplayName} (@${info.authorUsername})`} />
              <InfoRow label="دسته‌بندی" value={info.categoryName} />
              <InfoRow label="تاریخ ایجاد" value={formatJalaliDateTime(info.createdAt)} />
              <InfoRow label="آخرین ویرایش" value={editedLabel} />
              <InfoRow label="تعداد کاراکترها" value={info.bodyCharacterCount.toLocaleString("fa-IR")} />
              <InfoRow label="تعداد تگ‌ها" value={info.tagCount.toLocaleString("fa-IR")} />
            </dl>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
