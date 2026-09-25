"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const topicSchema = z
  .object({
    type: z.enum(["discussion", "question"]),
    categoryId: z.string().uuid("دسته نامعتبر است"),
    title: z.string().min(5, "عنوان باید حداقل ۵ کاراکتر باشد").max(150, "عنوان باید حداکثر ۱۵۰ کاراکتر باشد"),
    body: z.string().min(10, "متن تاپیک خیلی کوتاه است").max(20000, "متن تاپیک بیش از حد طولانی است"),
    questionContext: z.string().max(2000, "توضیح سوال بیش از حد طولانی است").optional(),
    tags: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "question" && (!value.questionContext || value.questionContext.trim().length < 5)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questionContext"],
        message: "برای تاپیک سوالی، توضیح سوال اجباری است",
      });
    }
  });

const replySchema = z.object({
  topicId: z.string().uuid("شناسه تاپیک نامعتبر است"),
  parentId: z.string().uuid().optional().or(z.literal("")),
  body: z.string().min(2, "متن پاسخ خیلی کوتاه است").max(10000, "متن پاسخ بیش از حد طولانی است"),
});

const reactionSchema = z.object({
  targetType: z.enum(["topic", "reply"]),
  targetId: z.string().uuid("شناسه هدف نامعتبر است"),
  topicId: z.string().uuid("شناسه تاپیک نامعتبر است"),
  value: z.coerce.number().refine((value) => value === 1 || value === -1, "مقدار واکنش نامعتبر است"),
});

const bestReplySchema = z.object({
  topicId: z.string().uuid(),
  replyId: z.string().uuid(),
});

const followTargetSchema = z.object({
  targetUserId: z.string().uuid("شناسه کاربر نامعتبر است"),
});

function toSlug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function createTopicAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;

    if (!user) {
      redirect("/login");
    }

    const parsed = topicSchema.safeParse({
      type: formData.get("type"),
      categoryId: formData.get("category_id"),
      title: formData.get("title"),
      body: formData.get("body"),
      questionContext: formData.get("question_context")?.toString().trim(),
      tags: formData.get("tags")?.toString().trim(),
    });

    if (!parsed.success) {
      redirect(`/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "داده ارسالی نامعتبر است")}`);
    }

    const payload = parsed.data;

    const { data: createdTopic, error: createError } = await supabase
      .from("topics")
      .insert({
        category_id: payload.categoryId,
        author_id: user.id,
        title: payload.title,
        body: payload.body,
        type: payload.type,
        question_context: payload.type === "question" ? payload.questionContext ?? null : null,
      })
      .select("id")
      .single();

    if (createError || !createdTopic) {
      console.error("createTopicAction createError", createError);
      redirect(`/new?error=${encodeURIComponent(`ساخت تاپیک انجام نشد: ${createError?.message ?? "خطای نامشخص"}`)}`);
    }

    const rawTags = (payload.tags ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 5);

    if (rawTags.length > 0) {
      for (const tagName of rawTags) {
        const slug = toSlug(tagName);

        const { data: existingTag } = await supabase.from("tags").select("id").eq("slug", slug).maybeSingle();

        let tagId = existingTag?.id as string | undefined;

        if (!tagId) {
          const { data: insertedTag, error: tagError } = await supabase
            .from("tags")
            .insert({ name: tagName, slug, is_official: false })
            .select("id")
            .single();

          if (tagError) {
            console.error("createTopicAction tag insert error", tagError);
            continue;
          }

          tagId = insertedTag.id;
        }

        if (tagId) {
          const { error: linkError } = await supabase.from("topic_tags").insert({ topic_id: createdTopic.id, tag_id: tagId });
          if (linkError) {
            console.error("createTopicAction topic_tag error", linkError);
          }
        }
      }
    }

    const { data: categoryRow } = await supabase.from("categories").select("slug").eq("id", payload.categoryId).maybeSingle();

    revalidatePath("/");
    if (categoryRow?.slug) {
      revalidatePath(`/c/${categoryRow.slug}`);
    }
    redirect(`/t/${createdTopic.id}`);
  } catch (error) {
    unstable_rethrow(error);
    console.error("createTopicAction unexpected", error);
    redirect(`/new?error=${encodeURIComponent("خطای غیرمنتظره در ساخت تاپیک")}`);
  }
}

export async function createReplyAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;

    if (!user) redirect("/login");

    const parsed = replySchema.safeParse({
      topicId: formData.get("topic_id"),
      parentId: formData.get("parent_id"),
      body: formData.get("body"),
    });

    if (!parsed.success) {
      redirect(`/t/${formData.get("topic_id")}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "داده پاسخ نامعتبر است")}`);
    }

    const { topicId, parentId, body } = parsed.data;

    const { data: topic, error: topicError } = await supabase
      .from("topics")
      .select("id,is_locked")
      .eq("id", topicId)
      .eq("is_deleted", false)
      .single();

    if (topicError || !topic) {
      redirect(`/t/${topicId}?error=${encodeURIComponent("تاپیک پیدا نشد")}`);
    }

    if (topic.is_locked) {
      redirect(`/t/${topicId}?error=${encodeURIComponent("این تاپیک قفل شده است")}`);
    }

    let depth = 0;
    let path = crypto.randomUUID().slice(0, 8);
    let normalizedParentId: string | null = null;

    if (parentId && parentId.length > 0) {
      const { data: parentReply, error: parentError } = await supabase
        .from("replies")
        .select("id,path,depth,topic_id")
        .eq("id", parentId)
        .single();

      if (parentError || !parentReply || parentReply.topic_id !== topicId) {
        redirect(`/t/${topicId}?error=${encodeURIComponent("پاسخ والد نامعتبر است")}`);
      }

      depth = (parentReply.depth ?? 0) + 1;
      path = `${parentReply.path}.${crypto.randomUUID().slice(0, 8)}`;
      normalizedParentId = parentReply.id;
    }

    const replyId = crypto.randomUUID();

    const { error: insertError } = await supabase.from("replies").insert({
      id: replyId,
      topic_id: topicId,
      author_id: user.id,
      parent_id: normalizedParentId,
      body,
      path,
      depth,
    });

    if (insertError) {
      console.error("createReplyAction insertError", insertError);
      redirect(`/t/${topicId}?error=${encodeURIComponent(`ارسال پاسخ انجام نشد: ${insertError.message}`)}`);
    }

    await supabase.from("topics").update({ last_activity: new Date().toISOString() }).eq("id", topicId);

    revalidatePath(`/t/${topicId}`);
    revalidatePath("/");
    redirect(`/t/${topicId}`);
  } catch (error) {
    unstable_rethrow(error);
    console.error("createReplyAction unexpected", error);
    const topicId = String(formData.get("topic_id") ?? "");
    redirect(`/t/${topicId}?error=${encodeURIComponent("خطای غیرمنتظره در ارسال پاسخ")}`);
  }
}

const reactionTargetSchema = z.object({
  targetType: z.enum(["topic", "reply"]),
  targetId: z.string().uuid("شناسه هدف نامعتبر است"),
  topicId: z.string().uuid("شناسه تاپیک نامعتبر است"),
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type ToggleReactionResult = {
  likeCount: number;
  dislikeCount: number;
  current: 1 | -1 | 0;
};

/**
 * روشن/خاموش کردن «فانوس» یک تاپیک یا پاسخ (لایک/دیسلایک با منطق toggle).
 * شمارنده‌ها توسط تریگر reactions_like_count_trigger روی سطر هدف نگه‌داری می‌شوند.
 */
export async function toggleReactionTargetAction(input: {
  targetType: "topic" | "reply";
  targetId: string;
  topicId: string;
  value: 1 | -1;
}): Promise<ToggleReactionResult> {
  try {
    const parsed = reactionTargetSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "واکنش نامعتبر است");
    }
    const { targetType, targetId, topicId, value } = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: existingReaction } = await supabase
      .from("reactions")
      .select("id,value")
      .eq("user_id", user.id)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .limit(1)
      .maybeSingle();

    let current: 1 | -1 | 0;

    if (!existingReaction) {
      const { error } = await supabase.from("reactions").insert({
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
        value,
      });
      if (error) {
        console.error("toggleReactionTargetAction insert error", error);
        throw new Error(
          error.code === "23505" ? "این واکنش قبلاً ثبت شده است" : "ثبت واکنش انجام نشد؛ دوباره تلاش کن",
        );
      }
      current = value;
    } else if (existingReaction.value === value) {
      const { error } = await supabase.from("reactions").delete().eq("id", existingReaction.id);
      if (error) {
        console.error("toggleReactionTargetAction delete error", error);
        throw new Error("حذف واکنش انجام نشد؛ دوباره تلاش کن");
      }
      current = 0;
    } else {
      const { error } = await supabase.from("reactions").update({ value }).eq("id", existingReaction.id);
      if (error) {
        console.error("toggleReactionTargetAction update error", error);
        throw new Error("به‌روزرسانی واکنش انجام نشد؛ دوباره تلاش کن");
      }
      current = value;
    }

    const table = targetType === "topic" ? "topics" : "replies";
    const { data: targetRow } = await supabase
      .from(table)
      .select("like_count,dislike_count")
      .eq("id", targetId)
      .limit(1)
      .maybeSingle();

    revalidatePath(`/t/${topicId}`);
    revalidatePath("/");

    return {
      likeCount: typeof targetRow?.like_count === "number" ? targetRow.like_count : 0,
      dislikeCount: typeof targetRow?.dislike_count === "number" ? targetRow.dislike_count : 0,
      current,
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error("toggleReactionTargetAction unexpected", error);
    throw error instanceof Error ? error : new Error("ثبت واکنش انجام نشد؛ دوباره تلاش کن");
  }
}

export async function selectBestReplyAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) redirect("/login");

    const parsed = bestReplySchema.safeParse({
      topicId: formData.get("topic_id"),
      replyId: formData.get("reply_id"),
    });

    if (!parsed.success) {
      redirect(`/t/${String(formData.get("topic_id") ?? "")}?error=${encodeURIComponent("انتخاب بهترین پاسخ نامعتبر است")}`);
    }

    const { topicId, replyId } = parsed.data;

    const { data: topic } = await supabase.from("topics").select("author_id").eq("id", topicId).single();

    if (!topic || topic.author_id !== user.id) {
      redirect(`/t/${topicId}?error=${encodeURIComponent("فقط نویسنده تاپیک می‌تواند بهترین پاسخ را انتخاب کند")}`);
    }

    const { error } = await supabase.from("topics").update({ best_reply_id: replyId, is_solved: true }).eq("id", topicId);

    if (error) {
      console.error("selectBestReplyAction error", error);
      redirect(`/t/${topicId}?error=${encodeURIComponent(`انتخاب بهترین پاسخ انجام نشد: ${error.message}`)}`);
    }

    revalidatePath(`/t/${topicId}`);
    redirect(`/t/${topicId}`);
  } catch (error) {
    unstable_rethrow(error);
    console.error("selectBestReplyAction unexpected", error);
    const topicId = String(formData.get("topic_id") ?? "");
    redirect(`/t/${topicId}?error=${encodeURIComponent("خطای غیرمنتظره در انتخاب بهترین پاسخ")}`);
  }
}

export type ToggleFollowResult = {
  following: boolean;
  followerCount: number;
};

/**
 * دنبال/لغو دنبال کردن یک کاربر. خروجی وضعیت تازه + تعداد دنبال‌کننده‌های هدف.
 */
export async function toggleFollowUserAction(input: { targetUserId: string }): Promise<ToggleFollowResult> {
  try {
    const { targetUserId } = followTargetSchema.parse(input);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    if (user.id === targetUserId) {
      throw new Error("نمی‌تونی خودت رو دنبال کنی");
    }

    const { data: existing } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .limit(1)
      .maybeSingle();

    let following: boolean;

    if (existing) {
      const { error } = await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
      if (error) {
        console.error("toggleFollowUserAction delete error", error);
        throw new Error("لغو دنبال‌کردن انجام نشد؛ دوباره تلاش کن");
      }
      following = false;
    } else {
      const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId });
      if (error) {
        console.error("toggleFollowUserAction insert error", error);
        throw new Error(error.code === "23505" ? "قبلاً دنبالش کرده‌ای" : "دنبال‌کردن انجام نشد؛ دوباره تلاش کن");
      }
      following = true;
    }

    const { count } = await supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", targetUserId);

    const { data: targetProfile } = await supabase.from("profiles").select("username").eq("id", targetUserId).limit(1).maybeSingle();

    revalidatePath("/");
    if (targetProfile?.username) {
      revalidatePath(`/u/${targetProfile.username}`);
    }

    return { following, followerCount: typeof count === "number" ? count : 0 };
  } catch (error) {
    unstable_rethrow(error);
    console.error("toggleFollowUserAction unexpected", error);
    throw error instanceof Error ? error : new Error("دنبال‌کردن انجام نشد؛ دوباره تلاش کن");
  }
}

const followListSchema = z.object({
  userId: z.string().uuid("شناسه کاربر نامعتبر است"),
  kind: z.enum(["followers", "following"]),
  offset: z.number().int().min(0).default(0),
});

export type FollowListUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
};

export type FollowListResult = {
  users: FollowListUser[];
  total: number;
  viewerFollowingIds: string[];
};

const FOLLOW_LIST_PAGE_SIZE = 50;

/** لیست دنبال‌کنندگان/دنبال‌شده‌ها برای مودال پروفایل — عمومی (بدون نیاز به ورود). */
export async function getFollowListAction(input: {
  userId: string;
  kind: "followers" | "following";
  offset?: number;
}): Promise<FollowListResult> {
  try {
    const { userId, kind, offset } = followListSchema.parse(input);

    const supabase = await createClient();

    const idColumn = kind === "followers" ? "follower_id" : "following_id";
    const filterColumn = kind === "followers" ? "following_id" : "follower_id";

    const { data: followRows, count, error: followError } = await supabase
      .from("follows")
      .select(idColumn, { count: "exact" })
      .eq(filterColumn, userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + FOLLOW_LIST_PAGE_SIZE - 1);

    if (followError) {
      console.error("getFollowListAction follows error", followError);
      throw new Error("دریافت لیست انجام نشد؛ دوباره تلاش کن");
    }

    const userIds = (followRows ?? []).map((row) => row[idColumn as keyof typeof row] as string);

    if (userIds.length === 0) {
      return { users: [], total: typeof count === "number" ? count : 0, viewerFollowingIds: [] };
    }

    const {
      data: { user: viewer },
    } = await supabase.auth.getUser();

    const [{ data: profileRows }, { data: viewerRows }] = await Promise.all([
      supabase.from("profiles").select("id,username,display_name,avatar_url,role").in("id", userIds),
      viewer
        ? supabase.from("follows").select("following_id").eq("follower_id", viewer.id).in("following_id", userIds)
        : Promise.resolve({ data: [] as { following_id: string }[] }),
    ]);

    const profileMap = new Map((profileRows ?? []).map((profile) => [profile.id, profile]));
    const orderedUsers = userIds
      .map((id) => profileMap.get(id))
      .filter((profile): profile is NonNullable<typeof profile> => Boolean(profile))
      .map((profile) => ({
        id: profile.id,
        username: profile.username,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        role: profile.role,
      }));

    const viewerFollowingIds = (viewerRows ?? []).map((row) => row.following_id);

    return {
      users: orderedUsers,
      total: typeof count === "number" ? count : orderedUsers.length,
      viewerFollowingIds,
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error("getFollowListAction unexpected", error);
    throw error instanceof Error ? error : new Error("دریافت لیست انجام نشد؛ دوباره تلاش کن");
  }
}
