import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = {
    hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasService: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  console.log("SDK calling:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,slug,icon,description,order")
      .order("order", { ascending: true });

    console.log("CATEGORIES DEBUG:", { data, error, count: data?.length, env });

    return Response.json({ data, error, count: data?.length ?? 0, env });
  } catch (error) {
    console.log("CATEGORIES DEBUG:", { data: null, error, count: 0, env });

    return Response.json(
      {
        data: null,
        error: error instanceof Error ? error.message : "unknown error",
        count: 0,
        env,
      },
      { status: 200 },
    );
  }
}
