import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toggleFollowUserAction } from "@/app/actions/forum";
import { TopicFeed } from "@/components/topic/topic-feed";
import { createClient } from "@/lib/supabase/server";
import { formatJalali, formatRelative } from "@/lib/jalali";
import { getPublicProfileByUsername, getRoleEmoji, getTopicsByAuthor } from "@/lib/forum-data";

type UserProfilePageProps = {
  params: Promise<{ username: string }>;
};

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params;

  const profile = await getPublicProfileByUsername(username);
  if (!profile) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const topics = await getTopicsByAuthor(profile.id);

  let isFollowing = false;

  if (user && user.id !== profile.id) {
    const { data } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", profile.id)
      .limit(1)
      .maybeSingle();
    isFollowing = Boolean(data);
  }

  const mappedTopics = topics.map((topic) => ({ ...topic, createdAtLabel: formatRelative(topic.createdAt) }));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <section className="rounded-2xl border border-[var(--border)] bg-[color:var(--surface)]/80 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt={profile.username} fill className="object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-sm text-zinc-400">@</div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-50">
                {profile.displayName || profile.username} {getRoleEmoji(profile.role)}
              </h1>
              <p className="text-sm text-zinc-400">@{profile.username}</p>
              <p className="mt-1 text-sm text-zinc-300">{profile.bio || "بیویی ثبت نشده."}</p>
            </div>
          </div>

          {user && user.id !== profile.id ? (
            <form action={toggleFollowUserAction}>
              <input type="hidden" name="user_id" value={profile.id} />
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-xl bg-purple-500 px-4 text-sm font-medium text-white hover:bg-purple-600"
              >
                {isFollowing ? "لغو دنبال‌کردن" : "دنبال‌کردن"}
              </button>
            </form>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-400">
          <span>شهر: {profile.city || "-"}</span>
          <span>شغل: {profile.job || "-"}</span>
          <span>عضویت: {formatJalali(profile.createdAt)}</span>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-50">تاپیک‌های کاربر</h2>
          <Link href="/" className="text-sm text-purple-300 hover:text-purple-200">
            بازگشت به فید
          </Link>
        </div>
        <TopicFeed topics={mappedTopics} />
      </section>
    </main>
  );
}
