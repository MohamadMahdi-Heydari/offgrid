// Shared types for the notification system (used by both server actions and client components).
// Kept outside the "use server" file because only async functions can be exported there.

export type NotificationActor = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
};

export type NotificationItem = {
  id: string;
  kind: string;
  isRead: boolean;
  createdAt: string;
  actor: NotificationActor | null;
  payload: Record<string, unknown>;
  /** عنوان تاپیک مربوطه (اگر در payload شناسه داشت) برای نمایش بهتر */
  topicTitle: string | null;
};

export type NotificationsResult = {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
};
