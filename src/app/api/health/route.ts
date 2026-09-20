export const dynamic = "force-dynamic";

export async function GET() {
  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  return Response.json({
    ok: true,
    service: "offgrid",
    env: hasSupabaseEnv ? "configured" : "missing",
    timestamp: new Date().toISOString(),
  });
}
