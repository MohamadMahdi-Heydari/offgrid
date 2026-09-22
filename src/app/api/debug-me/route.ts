import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    const userResult = await supabase.auth.getUser();
    const sessionResult = await supabase.auth.getSession();

    console.log("DEBUG_ME:", {
      userId: userResult.data.user?.id ?? null,
      userEmail: userResult.data.user?.email ?? null,
      userError: userResult.error?.message ?? null,
      hasSession: Boolean(sessionResult.data.session),
      sessionError: sessionResult.error?.message ?? null,
    });

    return Response.json({
      user: userResult.data.user
        ? {
            id: userResult.data.user.id,
            email: userResult.data.user.email,
            email_confirmed_at: (userResult.data.user as { email_confirmed_at?: string | null }).email_confirmed_at ?? null,
          }
        : null,
      authError: userResult.error?.message ?? null,
      hasSession: Boolean(sessionResult.data.session),
      sessionError: sessionResult.error?.message ?? null,
    });
  } catch (error) {
    console.error("DEBUG_ME unexpected error:", error);
    return Response.json(
      {
        user: null,
        authError: error instanceof Error ? error.message : "unknown error",
        hasSession: false,
        sessionError: null,
      },
      { status: 200 },
    );
  }
}
