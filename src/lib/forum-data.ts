import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

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
  authorRole: string;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  createdAt: Date;
  category: string;
  categorySlug: string;
  tags: string[];
  pinned: boolean;
  solved: boolean;
  type: "discussion" | "question";
};

export type TopicDetails = {
  id: string;
  title: string;
  body: string;
  type: "discussion" | "question";
  questionContext: string | null;
  bestReplyId: string | null;
  isSolved: boolean;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  createdAt: Date;
  authorId: string | null;
  authorUsername: string;
  authorRole: string;
  categoryName: string;
  categorySlug: string;
};

export type ReplyItem = {
  id: string;
  topicId: string;
  parentId: string | null;
  body: string;
  path: string;
  depth: number;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  createdAt: Date;
  authorId: string | null;
  authorUsername: string;
  authorRole: string;
};

export type PublicProfile = {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  city: string | null;
  job: string | null;
  role: string;
  createdAt: Date;
};



function createSupabasePublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase public environment variables.");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

const getOrderedCategoriesCached = unstable_cache(
  async () => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase.from("categories").select("id,name,slug,icon,description,order").order("order", { ascending: true });

    if (error) {
      console.error("getOrderedCategories error", error);
      return [] as CategoryNavItem[];
    }

    return (data ?? []).filter((item) => Number(item.order ?? 0) > 0) as CategoryNavItem[];
  },
  ["ordered-categories"],
  { revalidate: 300, tags: ["categories"] },
);

export async function getOrderedCategories() {
  try {
    return await getOrderedCategoriesCached();
  } catch (error) {
    console.error("getOrderedCategories unexpected", error);
    return [] as CategoryNavItem[];
  }
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getOrderedCategories();
  return categories.find((item) => item.slug === slug) ?? null;
}

type RawTopic = {
  id: string;
  title: string;
  body: string;
  type: "discussion" | "question";
  category_id: string | null;
  author_id: string | null;
  is_pinned: boolean;
  is_solved: boolean;
  like_count: number;
  dislike_count: number;
  reply_count: number;
  created_at: string;
};

async function mapTopics(rawTopics: RawTopic[]) {
  const supabase = createSupabasePublicClient();

  const categoryIds = [...new Set(rawTopics.map((t) => t.category_id).filter(Boolean))] as string[];
  const authorIds = [...new Set(rawTopics.map((t) => t.author_id).filter(Boolean))] as string[];

  const topicIds = rawTopics.map((topic) => topic.id);

  const [{ data: categoryRows }, { data: profileRows }, { data: topicTagRows }, { data: reactionRows }] = await Promise.all([
    categoryIds.length
      ? supabase.from("categories").select("id,name,slug").in("id", categoryIds)
      : Promise.resolve({ data: [] as { id: string; name: string; slug: string }[] }),
    authorIds.length
      ? supabase.from("profiles").select("id,username,role").in("id", authorIds)
      : Promise.resolve({ data: [] as { id: string; username: string; role: string }[] }),
    rawTopics.length
      ? supabase
          .from("topic_tags")
          .select("topic_id,tag_id")
          .in(
            "topic_id",
            topicIds,
          )
      : Promise.resolve({ data: [] as { topic_id: string; tag_id: string }[] }),
    rawTopics.length
      ? supabase.from("reactions").select("target_id,value").eq("target_type", "topic").in("target_id", topicIds)
      : Promise.resolve({ data: [] as { target_id: string; value: 1 | -1 }[] }),
  ]);

  const tagIds = [...new Set((topicTagRows ?? []).map((row) => row.tag_id))];
  const { data: tagRows } = tagIds.length
    ? await supabase.from("tags").select("id,name").in("id", tagIds)
    : { data: [] as { id: string; name: string }[] };

  const tagNameMap = new Map((tagRows ?? []).map((tag) => [tag.id, tag.name]));
  const categoryMap = new Map((categoryRows ?? []).map((item) => [item.id, item]));
  const profileMap = new Map((profileRows ?? []).map((item) => [item.id, item]));
  const tagMap = new Map<string, string[]>();
  const reactionCountMap = new Map<string, { like: number; dislike: number }>();

  (reactionRows ?? []).forEach((row) => {
    const current = reactionCountMap.get(row.target_id) ?? { like: 0, dislike: 0 };
    if (row.value === 1) current.like += 1;
    if (row.value === -1) current.dislike += 1;
    reactionCountMap.set(row.target_id, current);
  });

  (topicTagRows ?? []).forEach((row) => {
    const current = tagMap.get(row.topic_id) ?? [];
    const tagName = tagNameMap.get(row.tag_id);
    if (tagName) current.push(tagName);
    tagMap.set(row.topic_id, current);
  });

  return rawTopics.map((row) => {
    const category = row.category_id ? categoryMap.get(row.category_id) : null;
    const author = row.author_id ? profileMap.get(row.author_id) : null;

    const reactionCounts = reactionCountMap.get(row.id) ?? { like: row.like_count ?? 0, dislike: row.dislike_count ?? 0 };

    return {
      id: row.id,
      title: row.title,
      excerpt: row.body.slice(0, 190),
      author: author?.username ?? "guest",
      authorRole: author?.role ?? "user",
      likeCount: reactionCounts.like,
      dislikeCount: reactionCounts.dislike,
      replyCount: row.reply_count ?? 0,
      createdAt: new Date(row.created_at),
      category: category?.name ?? "بدون دسته",
      categorySlug: category?.slug ?? "general",
      tags: tagMap.get(row.id) ?? (row.type === "question" ? ["سوال"] : ["بحث"]),
      pinned: row.is_pinned,
      solved: row.is_solved,
      type: row.type,
    } satisfies FeedTopic;
  });
}

function hotScore(topic: FeedTopic) {
  const hoursSince = Math.max((Date.now() - topic.createdAt.getTime()) / 3_600_000, 0);
  return (topic.likeCount - topic.dislikeCount) / Math.pow(hoursSince + 2, 1.5) + topic.replyCount * 0.12;
}

export async function getTopicsFeed(sort: "hot" | "new", limit = 20) {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("topics")
      .select("id,title,body,type,category_id,author_id,is_pinned,is_solved,like_count,dislike_count,reply_count,created_at")
      .eq("is_deleted", false)
      .limit(limit)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getTopicsFeed error", error);
      return [] as FeedTopic[];
    }

    const mapped = await mapTopics((data ?? []) as RawTopic[]);

    if (sort === "new") {
      return mapped.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return mapped.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return hotScore(b) - hotScore(a);
    });
  } catch (error) {
    console.error("getTopicsFeed unexpected", error);
    return [] as FeedTopic[];
  }
}

export async function getTopicsByCategory(slug: string, limit = 20) {
  try {
    const category = await getCategoryBySlug(slug);
    if (!category) return [] as FeedTopic[];

    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("topics")
      .select("id,title,body,type,category_id,author_id,is_pinned,is_solved,like_count,dislike_count,reply_count,created_at")
      .eq("is_deleted", false)
      .eq("category_id", category.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("getTopicsByCategory error", error);
      return [] as FeedTopic[];
    }

    const mapped = await mapTopics((data ?? []) as RawTopic[]);
    return mapped.sort((a, b) => (a.pinned === b.pinned ? b.createdAt.getTime() - a.createdAt.getTime() : a.pinned ? -1 : 1));
  } catch (error) {
    console.error("getTopicsByCategory unexpected", error);
    return [] as FeedTopic[];
  }
}

export async function getTopicById(id: string) {
  try {
    const supabase = createSupabasePublicClient();
    const { data: topic, error } = await supabase
      .from("topics")
      .select(
        "id,title,body,type,question_context,best_reply_id,is_solved,like_count,dislike_count,reply_count,created_at,author_id,category_id",
      )
      .eq("id", id)
      .eq("is_deleted", false)
      .limit(1)
      .maybeSingle();

    if (error || !topic) return null;

    const [categoryResult, authorResult] = await Promise.all([
      topic.category_id
        ? supabase.from("categories").select("name,slug").eq("id", topic.category_id).limit(1).maybeSingle()
        : Promise.resolve({ data: null }),
      topic.author_id
        ? supabase.from("profiles").select("username,role").eq("id", topic.author_id).limit(1).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    // شمارنده‌های لایک/دیسلایک توسط تریگر reactions_like_count_trigger روی سطر
    // تاپیک به‌روز نگه داشته می‌شوند؛ خواندن مستقیم جدول reactions با نقش anon
    // به‌خاطر RLS همیشه خالی برمی‌گردد.
    const topicLikeCount = topic.like_count ?? 0;
    const topicDislikeCount = topic.dislike_count ?? 0;

    return {
      id: topic.id,
      title: topic.title,
      body: topic.body,
      type: topic.type,
      questionContext: topic.question_context,
      bestReplyId: topic.best_reply_id,
      isSolved: topic.is_solved,
      likeCount: topicLikeCount,
      dislikeCount: topicDislikeCount,
      replyCount: topic.reply_count ?? 0,
      createdAt: new Date(topic.created_at),
      authorId: topic.author_id,
      authorUsername: authorResult.data?.username ?? "guest",
      authorRole: authorResult.data?.role ?? "user",
      categoryName: categoryResult.data?.name ?? "بدون دسته",
      categorySlug: categoryResult.data?.slug ?? "general",
    } satisfies TopicDetails;
  } catch (error) {
    console.error("getTopicById unexpected", error);
    return null;
  }
}

export async function getRepliesByTopic(topicId: string) {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("replies")
      .select("id,topic_id,parent_id,body,path,depth,like_count,dislike_count,reply_count,created_at,author_id")
      .eq("topic_id", topicId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })
      .limit(500);

    if (error) {
      console.error("getRepliesByTopic error", error);
      return [] as ReplyItem[];
    }

    const rows = data ?? [];
    const authorIds = [...new Set(rows.map((row) => row.author_id).filter(Boolean))] as string[];
    const { data: authors } = authorIds.length
      ? await supabase.from("profiles").select("id,username,role").in("id", authorIds)
      : { data: [] as { id: string; username: string; role: string }[] };

    const authorMap = new Map((authors ?? []).map((author) => [author.id, author]));

    return rows.map((row) => {
      const author = row.author_id ? authorMap.get(row.author_id) : null;

      return {
        id: row.id,
        topicId: row.topic_id,
        parentId: row.parent_id,
        body: row.body,
        path: row.path,
        depth: row.depth ?? 0,
        likeCount: row.like_count ?? 0,
        dislikeCount: row.dislike_count ?? 0,
        replyCount: row.reply_count ?? 0,
        createdAt: new Date(row.created_at),
        authorId: row.author_id,
        authorUsername: author?.username ?? "guest",
        authorRole: author?.role ?? "user",
      } satisfies ReplyItem;
    });
  } catch (error) {
    console.error("getRepliesByTopic unexpected", error);
    return [] as ReplyItem[];
  }
}

export async function getPublicProfileByUsername(username: string) {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id,username,display_name,bio,avatar_url,city,job,role,created_at")
      .eq("username", username)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      username: data.username,
      displayName: data.display_name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      city: data.city,
      job: data.job,
      role: data.role,
      createdAt: new Date(data.created_at),
    } satisfies PublicProfile;
  } catch (error) {
    console.error("getPublicProfileByUsername unexpected", error);
    return null;
  }
}

export async function getTopicsByAuthor(authorId: string, limit = 50) {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("topics")
      .select("id,title,body,type,category_id,author_id,is_pinned,is_solved,like_count,dislike_count,reply_count,created_at")
      .eq("is_deleted", false)
      .eq("author_id", authorId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [] as FeedTopic[];
    return mapTopics((data ?? []) as RawTopic[]);
  } catch (error) {
    console.error("getTopicsByAuthor unexpected", error);
    return [] as FeedTopic[];
  }
}


