import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const admin = createAdminClient();

    const { data: topic, error: topicError } = await admin
      .from("topics")
      .select("id,author_id")
      .eq("is_deleted", false)
      .limit(1)
      .maybeSingle();

    if (topicError || !topic) {
      return Response.json({
        ok: false,
        stage: "topic-select",
        error: {
          message: topicError?.message ?? "No topic found",
          details: topicError?.details ?? null,
          hint: topicError?.hint ?? null,
          code: topicError?.code ?? null,
        },
      });
    }

    const { data: userProfile, error: userError } = await admin
      .from("profiles")
      .select("id")
      .neq("id", topic.author_id ?? "")
      .limit(1)
      .maybeSingle();

    if (userError || !userProfile) {
      return Response.json({
        ok: false,
        stage: "profile-select",
        error: {
          message: userError?.message ?? "No profile found",
          details: userError?.details ?? null,
          hint: userError?.hint ?? null,
          code: userError?.code ?? null,
        },
      });
    }

    const payload = {
      user_id: userProfile.id,
      target_type: "topic",
      target_id: topic.id,
      value: 1,
    } as const;

    const insertResult = await admin.from("reactions").insert(payload);

    if (insertResult.error && insertResult.error.code !== "23505") {
      return Response.json({
        ok: false,
        stage: "insert-reaction",
        payload,
        error: {
          message: insertResult.error.message,
          details: insertResult.error.details,
          hint: insertResult.error.hint,
          code: insertResult.error.code,
        },
      });
    }

    if (!insertResult.error) {
      await admin
        .from("reactions")
        .delete()
        .eq("user_id", payload.user_id)
        .eq("target_type", payload.target_type)
        .eq("target_id", payload.target_id);
    }

    return Response.json({
      ok: true,
      stage: "insert-reaction",
      payload,
      note: insertResult.error?.code === "23505" ? "Reaction already exists (unique key), insert path is reachable." : "Test insert succeeded and cleaned up.",
      error: insertResult.error
        ? {
            message: insertResult.error.message,
            details: insertResult.error.details,
            hint: insertResult.error.hint,
            code: insertResult.error.code,
          }
        : null,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        stage: "unexpected",
        error: error instanceof Error ? error.message : "unknown error",
      },
      { status: 500 },
    );
  }
}
