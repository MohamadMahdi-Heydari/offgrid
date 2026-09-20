import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, profiles, topics } from "@/db/schema";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

export type CategoryNavItem = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  description: string | null;
};

export type FeedTopic = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  roleEmoji: string;
  likeCount: number;
  replyCount: number;
  createdAt: Date;
  category: string;
  categorySlug: string;
  tags: string[];
  pinned: boolean;
  solved: boolean;
};

function roleToEmoji(role: string | null) {
  if (role === "legend") return "👑";
  if (role === "admin") return "⚙️";
  if (role === "moderator") return "🛡️";
  return "";
}

function normalizeTopic(row: {
  id: string;
  title: string;
  body: string;
  type: string;
  likeCount: number;
  replyCount: number;
  isPinned: boolean;
  isSolved: boolean;
  createdAt: Date;
  categoryName: string | null;
  categorySlug: string | null;
  username: string | null;
  role: string | null;
}): FeedTopic {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.body.slice(0, 190),
    author: row.username ?? "guest",
    roleEmoji: roleToEmoji(row.role),
    likeCount: row.likeCount,
    replyCount: row.replyCount,
    createdAt: row.createdAt,
    category: row.categoryName ?? "بدون دسته",
    categorySlug: row.categorySlug ?? "general",
    tags: row.type === "question" ? ["سوال"] : ["بحث"],
    pinned: row.isPinned,
    solved: row.isSolved,
  };
}

export async function getOrderedCategories() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,slug,icon,description,order")
      .gt("order", 0)
      .order("order", { ascending: true });

    console.log("CATEGORIES DEBUG:", { data, error, count: data?.length });

    if (error) {
      return [] as CategoryNavItem[];
    }

    return (data ?? []) as CategoryNavItem[];
  } catch (error) {
    console.log("CATEGORIES DEBUG:", { data: null, error, count: 0 });
    return [] as CategoryNavItem[];
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,slug,icon,description,order")
      .eq("slug", slug)
      .gt("order", 0)
      .limit(1)
      .maybeSingle();

    if (error) {
      return null;
    }

    return (data as CategoryNavItem | null) ?? null;
  } catch {
    return null;
  }
}

export async function getTopicsFeed(sort: "hot" | "new", limit = 20) {
  try {
    const hotScore = sql<number>`
      (
        (cast(${topics.likeCount} as float) - cast(${topics.dislikeCount} as float))
        / power(((extract(epoch from now() - ${topics.createdAt}) / 3600) + 2), 1.5)
      ) + (cast(${topics.replyCount} as float) * 0.12)
    `;

    const query = db
      .select({
        id: topics.id,
        title: topics.title,
        body: topics.body,
        type: topics.type,
        likeCount: topics.likeCount,
        replyCount: topics.replyCount,
        isPinned: topics.isPinned,
        isSolved: topics.isSolved,
        createdAt: topics.createdAt,
        categoryName: categories.name,
        categorySlug: categories.slug,
        username: profiles.username,
        role: profiles.role,
        hotScore,
      })
      .from(topics)
      .leftJoin(categories, eq(topics.categoryId, categories.id))
      .leftJoin(profiles, eq(topics.authorId, profiles.id))
      .where(eq(topics.isDeleted, false))
      .limit(limit);

    const rows =
      sort === "new"
        ? await query.orderBy(desc(topics.createdAt))
        : await query.orderBy(desc(topics.isPinned), desc(hotScore), desc(topics.createdAt));

    return rows.map((row) => normalizeTopic(row));
  } catch {
    return [] as FeedTopic[];
  }
}

export async function getTopicsByCategory(slug: string, limit = 20) {
  try {
    const rows = await db
      .select({
        id: topics.id,
        title: topics.title,
        body: topics.body,
        type: topics.type,
        likeCount: topics.likeCount,
        replyCount: topics.replyCount,
        isPinned: topics.isPinned,
        isSolved: topics.isSolved,
        createdAt: topics.createdAt,
        categoryName: categories.name,
        categorySlug: categories.slug,
        username: profiles.username,
        role: profiles.role,
      })
      .from(topics)
      .leftJoin(categories, eq(topics.categoryId, categories.id))
      .leftJoin(profiles, eq(topics.authorId, profiles.id))
      .where(and(eq(categories.slug, slug), eq(topics.isDeleted, false)))
      .orderBy(desc(topics.isPinned), desc(topics.createdAt))
      .limit(limit);

    return rows.map((row) => normalizeTopic(row));
  } catch {
    return [] as FeedTopic[];
  }
}
