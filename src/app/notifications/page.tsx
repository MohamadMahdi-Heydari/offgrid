import { redirect } from "next/navigation";
import { getNotificationsAction } from "@/app/actions/notifications";
import { NOTIFICATION_PAGE_SIZE } from "@/types/notifications-page-size";
import { NotificationList } from "@/components/notifications/notification-list";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const initial = await getNotificationsAction({ offset: 0, limit: NOTIFICATION_PAGE_SIZE });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-zinc-50">نوتیفیکیشن‌ها</h1>
        <p className="mt-1 text-sm text-zinc-400">فالو، پاسخ‌ها و فانوس‌های روشن‌شده‌ی تاپیک‌ها و پاسخ‌هایت اینجا می‌رسن.</p>
      </header>

      <NotificationList initial={initial} />
    </main>
  );
}
