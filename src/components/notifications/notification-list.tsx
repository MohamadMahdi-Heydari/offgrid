"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Bell, CheckCheck, Inbox, Trash2 } from "lucide-react";
import {
  deleteAllNotificationsAction,
  getNotificationsAction,
  markAllNotificationsReadAction,
} from "@/app/actions/notifications";
import type { NotificationItem, NotificationsResult } from "@/types/notifications";
import { NOTIFICATION_PAGE_SIZE } from "@/types/notifications-page-size";
import { NotificationItemRow } from "@/components/notifications/notification-item";

type GroupKey = "today" | "yesterday" | "thisWeek" | "thisMonth" | "older";

const GROUP_LABELS: Record<GroupKey, string> = {
  today: "امروز",
  yesterday: "دیروز",
  thisWeek: "این هفته",
  thisMonth: "این ماه",
  older: "قدیمی‌تر",
};

function groupKey(dateString: string): GroupKey {
  const date = new Date(dateString);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const weekAgo = new Date(startOfToday);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(startOfToday);
  monthAgo.setDate(monthAgo.getDate() - 30);

  if (date >= startOfToday) return "today";
  if (date >= startOfYesterday) return "yesterday";
  if (date >= weekAgo) return "thisWeek";
  if (date >= monthAgo) return "thisMonth";
  return "older";
}

const GROUP_ORDER: GroupKey[] = ["today", "yesterday", "thisWeek", "thisMonth", "older"];

type NotificationListProps = {
  initial: NotificationsResult;
};

export function NotificationList({ initial }: NotificationListProps) {
  const [items, setItems] = useState<NotificationItem[]>(initial.notifications);
  const [total, setTotal] = useState(initial.total);
  const [unreadCount, setUnreadCount] = useState(initial.unreadCount);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyAction, setBusyAction] = useState<"mark-all" | "delete-all" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(() => {
    setLoadingMore(true);
    setError(null);
    getNotificationsAction({ offset: items.length, limit: NOTIFICATION_PAGE_SIZE })
      .then((result) => {
        setItems((prev) => [...prev, ...result.notifications]);
        setTotal(result.total);
        setUnreadCount(result.unreadCount);
      })
      .catch((err) => {
        console.error("load more notifications error", err);
        setError("بارگذاری بیشتر انجام نشد");
      })
      .finally(() => setLoadingMore(false));
  }, [items.length]);

  function markAll() {
    setBusyAction("mark-all");
    markAllNotificationsReadAction();
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    setBusyAction(null);
  }

  function deleteAll() {
    setBusyAction("delete-all");
    deleteAllNotificationsAction();
    setItems([]);
    setTotal(0);
    setUnreadCount(0);
    setBusyAction(null);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-[color:var(--surface)]/50 p-10 text-center">
        <Inbox className="mx-auto h-8 w-8 text-purple-300/70" aria-hidden="true" />
        <p className="mt-3 text-lg font-semibold text-zinc-100">هنوز نوتیفیکیشنی نداری</p>
        <p className="mt-2 text-sm text-zinc-400">وقتی کسی به تاپیکت پاسخ بده یا دنبالت کنه، اینجا میبینی.</p>
        <Link
          href="/"
          className="mt-4 inline-flex h-10 items-center rounded-xl bg-purple-500 px-4 text-sm font-medium text-white transition-all duration-200 hover:bg-purple-600 active:scale-[0.98]"
        >
          برگرد به فید
        </Link>
      </div>
    );
  }

  // گروه‌بندی زمانی
  const groups = new Map<GroupKey, NotificationItem[]>();
  for (const item of items) {
    const key = groupKey(item.createdAt);
    const bucket = groups.get(key) ?? [];
    bucket.push(item);
    groups.set(key, bucket);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">
          <Bell className="ms-1 inline h-4 w-4 text-purple-300" aria-hidden="true" />
          {unreadCount > 0
            ? `${unreadCount.toLocaleString("fa-IR")} خوانده‌نشده از مجموع ${total.toLocaleString("fa-IR")}`
            : `${total.toLocaleString("fa-IR")} نوتیفیکیشن — همه خوانده شدن`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={markAll}
            disabled={busyAction !== null || unreadCount === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-zinc-300 transition-all duration-200 hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
            علامت زدن همه
          </button>
          <button
            type="button"
            onClick={deleteAll}
            disabled={busyAction !== null}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-zinc-300 transition-all duration-200 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            حذف همه
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {GROUP_ORDER.filter((key) => groups.has(key)).map((key) => (
          <section key={key}>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">{GROUP_LABELS[key]}</h2>
            <ul className="space-y-1 rounded-2xl border border-white/10 bg-zinc-900/40 p-1.5">
              {(groups.get(key) ?? []).map((notification) => (
                <li key={notification.id}>
                  <NotificationItemRow notification={notification} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {error ? <p className="mt-3 text-center text-xs text-red-400">{error}</p> : null}

      {items.length < total ? (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex h-10 items-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm text-zinc-300 transition-all duration-200 hover:bg-white/10 active:scale-[0.98] disabled:opacity-60"
          >
            {loadingMore ? "در حال بارگذاری…" : "نمایش بیشتر"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
