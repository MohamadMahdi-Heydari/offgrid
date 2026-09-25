"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Flame, MessageCircle, MessageSquare, UserPlus } from "lucide-react";
import type { NotificationItem } from "@/types/notifications";
import { markNotificationReadAction } from "@/app/actions/notifications";
import { formatRelative } from "@/lib/jalali";

const KIND_META: Record<string, { icon: typeof Bell; text: (actorName: string, topicTitle: string | null) => string; accent: string }> = {
  topic_reply: {
    icon: MessageCircle,
    text: (actorName, topicTitle) => `${actorName} به تاپیکت «${topicTitle ?? ""}» پاسخ داد`,
    accent: "text-purple-300",
  },
  reply_reply: {
    icon: MessageSquare,
    text: (actorName) => `${actorName} به پاسخت پاسخ داد`,
    accent: "text-purple-300",
  },
  new_follower: {
    icon: UserPlus,
    text: (actorName) => `${actorName} دنبالت کرد`,
    accent: "text-emerald-300",
  },
  topic_like: {
    icon: Flame,
    text: (actorName, topicTitle) => `${actorName} فانوس تاپیکت «${topicTitle ?? ""}» رو روشن کرد`,
    accent: "text-amber-300",
  },
  reply_like: {
    icon: Flame,
    text: (actorName) => `${actorName} فانوس پاسخت رو روشن کرد`,
    accent: "text-amber-300",
  },
};

function resolveHref(notification: NotificationItem): string {
  const payload = notification.payload;
  const topicId = typeof payload.topic_id === "string" ? payload.topic_id : null;
  const replyId = typeof payload.reply_id === "string" ? payload.reply_id : null;
  const targetType = typeof payload.target_type === "string" ? payload.target_type : null;
  const targetId = typeof payload.target_id === "string" ? payload.target_id : null;

  switch (notification.kind) {
    case "topic_reply":
      return topicId ? `/t/${topicId}#replies` : "/";
    case "reply_reply":
      return topicId && replyId ? `/t/${topicId}#reply-${replyId}` : topicId ? `/t/${topicId}` : "/";
    case "topic_like":
      return targetType === "topic" && targetId ? `/t/${targetId}` : "/";
    case "reply_like": {
      const landTopic = topicId ?? null;
      const landReply = replyId ?? targetId;
      return landTopic && landReply ? `/t/${landTopic}#reply-${landReply}` : "/";
    }
    case "new_follower":
      return notification.actor ? `/u/${notification.actor.username}` : "/";
    default:
      return "/";
  }
}

type NotificationItemRowProps = {
  notification: NotificationItem;
  /** وقتی روی ردیف کلیک می‌شود — برای بسته شدن dropdown اگر باز باشد */
  onNavigate?: () => void;
  compact?: boolean;
};

export function NotificationItemRow({ notification, onNavigate, compact = false }: NotificationItemRowProps) {
  const router = useRouter();
  const meta = KIND_META[notification.kind] ?? { icon: Bell, text: () => "فعالیتی مرتبط با تو", accent: "text-zinc-300" };
  const Icon = meta.icon;

  const actorName = notification.actor?.displayName || notification.actor?.username || "کاربر آفگرید";
  const text = meta.text(actorName, notification.topicTitle);

  async function open() {
    if (!notification.isRead) {
      markNotificationReadAction(notification.id); // آتش و رها — UI خوش‌بینانه جلو می‌رود
    }
    onNavigate?.();
    router.push(resolveHref(notification));
  }

  return (
    <button
      type="button"
      onClick={open}
      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-right transition-colors hover:bg-white/5 ${
        notification.isRead ? "opacity-80" : "bg-purple-500/5"
      }`}
    >
      <span className="relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-purple-500/15">
        {notification.actor?.avatarUrl ? (
          <Image src={notification.actor.avatarUrl} alt={actorName} fill className="object-cover" sizes="40px" />
        ) : (
          <span className={`grid h-full w-full place-items-center ${meta.accent}`}>
            <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm text-zinc-100">{text}</span>
        <span className="mt-0.5 block text-xs text-zinc-500">{formatRelative(notification.createdAt)}</span>
      </span>

      {!notification.isRead ? (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-purple-400"
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}
