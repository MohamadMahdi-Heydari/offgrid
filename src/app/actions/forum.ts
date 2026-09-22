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

const followSchema = z.object({
  userId: z.string().uuid(),
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

async function syncReactionCounts(targetType: "topic" | "reply", targetId: string) {
  const supabase = await createClient();
  const { data: reactions } = await supabase.from("reactions").select("value").eq("target_type", targetType).eq("target_id", targetId);

  const likeCount = (reactions ?? []).filter((row) => row.value === 1).length;
  const dislikeCount = (reactions ?? []).filter((row) => row.value === -1).length;

  if (targetType === "topic") {
    await supabase.from("topics").update({ like_count: likeCount, dislike_count: dislikeCount }).eq("id", targetId);
  } else {
    await supabase.from("replies").update({ like_count: likeCount, dislike_count: dislikeCount }).eq("id", targetId);
  }
}

export async function toggleReactionAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) redirect("/login");

    const parsed = reactionSchema.safeParse({
      targetType: formData.get("target_type"),
      targetId: formData.get("target_id"),
      topicId: formData.get("topic_id"),
      value: formData.get("value"),
    });

    if (!parsed.success) {
      redirect(`/t/${String(formData.get("topic_id") ?? "")}?error=${encodeURIComponent("واکنش نامعتبر است")}`);
    }

    const { targetType, targetId, topicId, value } = parsed.data;

    const { data: existingReaction } = await supabase
      .from("reactions")
      .select("id,value")
      .eq("user_id", user.id)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .limit(1)
      .maybeSingle();

    if (!existingReaction) {
      const { error } = await supabase.from("reactions").insert({
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
        value,
      });
      if (error) console.error("toggleReactionAction insert error", error);
    } else if (existingReaction.value === value) {
      const { error } = await supabase.from("reactions").delete().eq("id", existingReaction.id);
      if (error) console.error("toggleReactionAction delete error", error);
    } else {
      const { error } = await supabase.from("reactions").update({ value }).eq("id", existingReaction.id);
      if (error) console.error("toggleReactionAction update error", error);
    }

    await syncReactionCounts(targetType, targetId);
    revalidatePath(`/t/${topicId}`);
    revalidatePath("/");
  } catch (error) {
    unstable_rethrow(error);
    console.error("toggleReactionAction unexpected", error);
  }
}

export async function toggleTopicReactionAction(input: { topicId: string; value: 1 | -1 }) {
  try {
    const supabase = await createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) throw new Error("کاربر وارد نشده است");

    const topicId = z.string().uuid().parse(input.topicId);
    const value = z.union([z.literal(1), z.literal(-1)]).parse(input.value);

    const { data: existingReaction } = await supabase
      .from("reactions")
      .select("id,value")
      .eq("user_id", user.id)
      .eq("target_type", "topic")
      .eq("target_id", topicId)
      .limit(1)
      .maybeSingle();

    if (!existingReaction) {
      const { error } = await supabase.from("reactions").insert({
        user_id: user.id,
        target_type: "topic",
        target_id: topicId,
        value,
      });
      if (error) throw new Error(error.message);
    } else if (existingReaction.value === value) {
      const { error } = await supabase.from("reactions").delete().eq("id", existingReaction.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("reactions").update({ value }).eq("id", existingReaction.id);
      if (error) throw new Error(error.message);
    }

    await syncReactionCounts("topic", topicId);

    const { data: topic } = await supabase.from("topics").select("like_count,dislike_count").eq("id", topicId).single();

    revalidatePath(`/t/${topicId}`);
    revalidatePath("/");

    return {
      likeCount: topic?.like_count ?? 0,
      dislikeCount: topic?.dislike_count ?? 0,
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error("toggleTopicReactionAction unexpected", error);
    throw error;
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

export async function toggleFollowUserAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const userResult = await supabase.auth.getUser();
    const currentUser = userResult.data.user;
    if (!currentUser) redirect("/login");

    const parsed = followSchema.safeParse({ userId: formData.get("user_id") });
    if (!parsed.success) return;

    const { userId } = parsed.data;

    if (currentUser.id === userId) return;

    const { data: existing } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", userId)
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabase.from("follows").delete().eq("follower_id", currentUser.id).eq("following_id", userId);
    } else {
      await supabase.from("follows").insert({ follower_id: currentUser.id, following_id: userId });
    }

    revalidatePath("/");
  } catch (error) {
    unstable_rethrow(error);
    console.error("toggleFollowUserAction unexpected", error);
  }
}
