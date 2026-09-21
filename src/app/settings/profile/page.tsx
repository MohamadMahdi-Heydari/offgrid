import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/settings/profile-form";

type SettingsProfilePageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function SettingsProfilePage({ searchParams }: SettingsProfilePageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,bio,city,job,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <section className="rounded-2xl border border-[var(--border)] bg-[color:var(--surface)]/80 p-6">
        <h1 className="text-2xl font-bold text-zinc-50">تنظیمات پروفایل</h1>
        <p className="mt-2 text-sm text-zinc-400">اطلاعات عمومی پروفایلت رو اینجا مدیریت کن.</p>

        {params.success ? (
          <p className="mt-4 rounded-xl bg-emerald-500/15 p-3 text-sm text-emerald-300">تغییرات با موفقیت ذخیره شد.</p>
        ) : null}

        {params.error ? <p className="mt-4 rounded-xl bg-red-500/15 p-3 text-sm text-red-300">{params.error}</p> : null}

        <ProfileForm
          userId={user.id}
          initialDisplayName={profile?.display_name ?? ""}
          initialBio={profile?.bio ?? ""}
          initialCity={profile?.city ?? ""}
          initialJob={profile?.job ?? ""}
          initialAvatarUrl={profile?.avatar_url ?? ""}
        />
      </section>
    </main>
  );
}
