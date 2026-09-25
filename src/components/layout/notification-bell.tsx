"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck, X } from "lucide-react";
import { getNotificationsAction, markAllNotificationsReadAction } from "@/app/actions/notifications";
import type { NotificationItem } from "@/types/notifications";
import { NOTIFICATION_PAGE_SIZE } from "@/types/notifications-page-size";
import { NotificationItemRow } from "@/components/notifications/notification-item";

/** فقط ۹+ نشان داده می‌شود تا badge از حالت دایره خارج نشود */
function badgeLabel(count: number): string {
  return count > 9 ? "+۹" : count.toLocaleString("fa-IR");
}

type NotificationBellProps = {
  /** تعداد خوانده‌نشدهٔ اولیه از سرور (render هدر) */
  initialUnreadCount: number;
};

export function NotificationBell({ initialUnreadCount }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState<NotificationItem[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // حالت لودینگ از nالاپ بودن دیتا مشتق می‌شود نه setState در effect
  const loading = loaded === null;

  // آوکسی بیرون / ESC → بستن
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // lazy load وقتی dropdown باز می‌شود (فقط یک‌بار)
  useEffect(() => {
    if (!open || loaded !== null) return;

    let cancelled = false;

    getNotificationsAction({ offset: 0, limit: NOTIFICATION_PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setLoaded(result.notifications);
        setUnreadCount(result.unreadCount);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("notification bell load error", err);
        setError("دریافت نوتیف‌ها انجام نشد");
      });

    return () => {
      cancelled = true;
    };
  }, [open, loaded]);

  // poll سبک هر ۶۰ ثانیه برای تازه نگه داشتن badge
  useEffect(() => {
    const timer = window.setInterval(() => {
      getNotificationsAction({ offset: 0, limit: 1 })
        .then((result) => setUnreadCount(result.unreadCount))
        .catch(() => {
          /* اتصال لحظه‌ای افتاد؛ badge همان قبلی می‌ماند */
        });
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  async function markAll() {
    markAllNotificationsReadAction();
    setUnreadCount(0);
    setLoaded((prev) => (prev ? prev.map((item) => ({ ...item, isRead: true })) : prev));
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`اعلان‌ها${unreadCount > 0 ? ` (${unreadCount.toLocaleString("fa-IR")} خوانده‌نشده)` : ""}`}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        {unreadCount > 0 ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-purple-500 px-1 text-[10px] font-bold text-white shadow-[0_0_12px_-2px_rgba(168,85,247,0.9)]"
          >
            {badgeLabel(unreadCount)}
          </motion.span>
        ) : null}
      </button>

      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15 }}
          className="absolute end-0 top-full z-50 mt-2 w-screen max-w-sm rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/60 sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <p className="text-sm font-semibold text-zinc-100">نوتیفیکیشن‌ها</p>
            <div className="flex items-center gap-1">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAll}
                  title="علامت زدن همه به‌عنوان خوانده‌شده"
                  className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-emerald-300"
                >
                  <CheckCheck className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="بستن"
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {error && loaded === null ? (
              <p className="px-4 py-6 text-center text-sm text-red-400">{error}</p>
            ) : loading ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="flex animate-pulse items-start gap-3 rounded-xl px-3 py-2.5">
                    <div className="h-10 w-10 rounded-full bg-zinc-800" />
                    <div className="flex-1">
                      <div className="h-3.5 w-40 rounded bg-zinc-800" />
                      <div className="mt-2 h-3 w-20 rounded bg-zinc-800/70" />
                    </div>
                  </div>
                ))}
              </div>
            ) : loaded && loaded.length > 0 ? (
              <p className="px-4 py-6 text-center text-sm text-red-400">{error}</p>
            ) : loaded && loaded.length > 0 ? (
              <ul className="space-y-1">
                {loaded.map((notification) => (
                  <li key={notification.id}>
                    <NotificationItemRow notification={notification} compact onNavigate={() => setOpen(false)} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-center text-sm text-zinc-500">نوتیفی نداری — وقتی کسی به تاپیکت پاسخ بده اینجا میاد</p>
            )}
          </div>

          <div className="border-t border-white/10 p-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-center text-sm text-purple-300 transition-colors hover:bg-purple-500/10"
            >
              مشاهده همه نوتیفیکیشن‌ها
            </Link>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
