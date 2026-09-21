"use client";

import { useState } from "react";
import { updateProfileAction } from "@/app/actions/auth";
import { AvatarUploader } from "@/components/settings/avatar-uploader";

type ProfileFormProps = {
  userId: string;
  initialDisplayName: string;
  initialBio: string;
  initialCity: string;
  initialJob: string;
  initialAvatarUrl: string;
};

export function ProfileForm({
  userId,
  initialDisplayName,
  initialBio,
  initialCity,
  initialJob,
  initialAvatarUrl,
}: ProfileFormProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  return (
    <form action={updateProfileAction} className="mt-5 space-y-4">
      <AvatarUploader userId={userId} initialUrl={initialAvatarUrl} onUploaded={setAvatarUrl} />

      <input type="hidden" name="avatar_url" value={avatarUrl} />

      <div>
        <label className="mb-1 block text-sm text-zinc-300" htmlFor="display_name">
          نام نمایشی
        </label>
        <input
          id="display_name"
          name="display_name"
          defaultValue={initialDisplayName}
          className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-300" htmlFor="bio">
          بیو
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={initialBio}
          className="w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-300" htmlFor="city">
            شهر
          </label>
          <input
            id="city"
            name="city"
            defaultValue={initialCity}
            className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-300" htmlFor="job">
            شغل
          </label>
          <input
            id="job"
            name="job"
            defaultValue={initialJob}
            className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
          />
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex h-11 items-center rounded-xl bg-purple-500 px-4 text-sm font-semibold text-white transition-all hover:bg-purple-600"
      >
        ذخیره تغییرات
      </button>
    </form>
  );
}
