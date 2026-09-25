"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { NotificationItem, NotificationsResult } from "@/types/notifications";
import { NOTIFICATION_PAGE_SIZE } from "@/types/notifications-page-size";

const listSchema = z.object({
  offset: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(NOTIFICATION_PAGE_SIZE),
});

type RawNotificationRow = {
  id: string;
  kind: string;
  is_read: boolean;
  created_at: string;
  payload: Record<string, unknown> | null;
};

function extractActorId(payload: Record<string, unknown> | null): string | null {
  const actorId = payload?.actor_id;
  return typeof actorId === "string" && actorId.length > 0 ? actorId : null;
}

const getNotificationActor = extractActorId;

async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("برای دیدن نوتیفیکیشن‌ها باید وارد شوی");
  }

  return { supabase, user };
}

/** لیست نوتیف‌ها + تعداد کل و خوانده‌نشده — فقط برای خود کاربر (RLS). */
export async function getNotificationsAction(input: { offset?: number; limit?: number } = {}): Promise<NotificationsResult> {
  try {
    const { offset, limit } = listSchema.parse(input);
    const { supabase } = await currentUser();

    const [{ data: rows, count: total }, { count: unreadCount }] = await Promise.all([
      supabase
        .from("notifications")
        .select("id,kind,is_read,created_at,payload", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1),
      supabase.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false),
    ]);

    const notifications = (rows ?? []) as RawNotificationRow[];

    // batch resolve: actorها و عنوان تاپیک‌ها در دو کوئری
    const actorIds = [...new Set(notifications.map((row) => getNotificationActor(row.payload)).filter(Boolean))] as string[];
    const topicIds = [...new Set(notifications.map((row) => {
      const payload = row.payload;
      return typeof payload?.topic_id === "string"
        ? (payload.topic_id as string)
        : typeof payload?.target_id === "string" && payload?.target_type === "topic"
          ? (payload.target_id as string)
          : null;
    }).filter(Boolean))] as string[];

    const [{ data: profileRows }, { data: topicRows }] = await Promise.all([
      actorIds.length
        ? supabase.from("profiles").select("id,username,display_name,avatar_url,role").in("id", actorIds)
        : Promise.resolve({ data: [] as { id: string; username: string; display_name: string | null; avatar_url: string | null; role: string }[] }),
      topicIds.length
        ? supabase.from("topics").select("id,title").in("id", topicIds)
        : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    ]);

    const profileMap = new Map((profileRows ?? []).map((profile) => [profile.id, profile]));
    const topicTitleMap = new Map((topicRows ?? []).map((topic) => [topic.id, topic.title]));

    return {
      notifications: notifications.map((row) => {
        const actorId = getNotificationActor(row.payload);
        const actor = actorId ? profileMap.get(actorId) : null;
        const topicId =
          typeof row.payload?.topic_id === "string"
            ? (row.payload.topic_id as string)
            : typeof row.payload?.target_id === "string" && row.payload?.target_type === "topic"
              ? (row.payload.target_id as string)
              : null;

        return {
          id: row.id,
          kind: row.kind,
          isRead: row.is_read,
          createdAt: row.created_at,
          actor: actor
            ? {
                id: actor.id,
                username: actor.username,
                displayName: actor.display_name,
                avatarUrl: actor.avatar_url,
                role: actor.role,
              }
            : null,
          payload: row.payload ?? {},
          topicTitle: topicId ? (topicTitleMap.get(topicId) ?? null) : null,
        };
      }),
      total: typeof total === "number" ? total : notifications.length,
      unreadCount: typeof unreadCount === "number" ? unreadCount : 0,
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error("getNotificationsAction unexpected", error);
    throw error instanceof Error ? error : new Error("دریافت نوتیفیکیشن‌ها انجام نشد");
  }
}

/** فقط تعداد خوانده‌نشده — برای badge سبک هدر. */
export async function getUnreadCountAction(): Promise<number> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return 0;

    const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false);
    return typeof count === "number" ? count : 0;
  } catch (error) {
    unstable_rethrow(error);
    console.error("getUnreadCountAction unexpected", error);
    return 0;
  }
}

const idSchema = z.string().uuid("شناسه نوتیف نامعتبر است");

/** علامت‌خوردن تک‌نوتیف به‌عنوان خوانده‌شده. */
export async function markNotificationReadAction(notificationId: string): Promise<void> {
  try {
    const id = idSchema.parse(notificationId);
    const { supabase, user } = await currentUser();

    await supabase.from("notifications").update({ is_read: true }).eq("id", id).eq("user_id", user.id);
    revalidatePath("/notifications");
  } catch (error) {
    unstable_rethrow(error);
    console.error("markNotificationReadAction unexpected", error);
  }
}

/** علامت‌زدن همه‌ی خوانده‌نشده‌ها. */
export async function markAllNotificationsReadAction(): Promise<void> {
  try {
    const { supabase, user } = await currentUser();

    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    revalidatePath("/notifications");
  } catch (error) {
    unstable_rethrow(error);
    console.error("markAllNotificationsReadAction unexpected", error);
  }
}

/** حذف همه‌ی نوتیف‌های کاربر (پاک‌سازی کامل لیست). */
export async function deleteAllNotificationsAction(): Promise<void> {
  try {
    const { supabase, user } = await currentUser();

    await supabase.from("notifications").delete().eq("user_id", user.id);
    revalidatePath("/notifications");
  } catch (error) {
    unstable_rethrow(error);
    console.error("deleteAllNotificationsAction unexpected", error);
  }
}
