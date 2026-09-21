"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AvatarUploaderProps = {
  userId: string;
  initialUrl: string;
  onUploaded: (url: string) => void;
};

export function AvatarUploader({ userId, initialUrl, onUploaded }: AvatarUploaderProps) {
  const [preview, setPreview] = useState(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > 2 * 1024 * 1024) {
      setError("حداکثر حجم فایل ۲ مگابایت است");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("فقط فایل تصویری مجاز است");
      return;
    }

    setIsUploading(true);

    const supabase = createClient();
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
      upsert: true,
      cacheControl: "3600",
    });

    if (uploadError) {
      setError("آپلود آواتار انجام نشد");
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    if (!data.publicUrl) {
      setError("دریافت لینک آواتار انجام نشد");
      setIsUploading(false);
      return;
    }

    setPreview(data.publicUrl);
    onUploaded(data.publicUrl);
    setIsUploading(false);
  }

  return (
    <div>
      <p className="mb-2 text-sm text-zinc-300">آواتار</p>
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
          {preview ? (
            <Image src={preview} alt="آواتار" fill className="object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-zinc-400">بدون عکس</div>
          )}
        </div>

        <label className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-zinc-200 transition-all hover:bg-white/10">
          {isUploading ? "در حال آپلود..." : "آپلود آواتار"}
          <input type="file" accept="image/*" className="hidden" onChange={onChange} disabled={isUploading} />
        </label>
      </div>

      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
