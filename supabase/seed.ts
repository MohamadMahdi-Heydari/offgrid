import { db } from "@/db";
import { categories, profiles, tags } from "@/db/schema";

async function seed() {
  const baseCategories = [
    ["عمومی", "general"],
    ["فناوری", "technology"],
    ["برنامه‌نویسی", "programming"],
    ["بازی", "gaming"],
    ["فیلم و سریال", "movies-series"],
    ["کتاب", "books"],
    ["موسیقی", "music"],
    ["خودرو", "cars"],
    ["سلامت", "health"],
    ["کسب‌وکار", "business"],
  ] as const;

  const baseTags = [
    ["سوال", "question"],
    ["بحث", "discussion"],
    ["کمک", "help"],
    ["خبر", "news"],
    ["آموزش", "tutorial"],
  ] as const;

  await db
    .insert(categories)
    .values(
      baseCategories.map(([name, slug], index) => ({
        name,
        slug,
        order: index,
        description: `دسته ${name} در آفگرید`,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(tags)
    .values(baseTags.map(([name, slug]) => ({ name, slug, isOfficial: true })))
    .onConflictDoNothing();

  const legendId = process.env.LEGEND_USER_ID;
  const legendUsername = process.env.LEGEND_USERNAME ?? "offgrid.legend";

  if (legendId) {
    await db
      .insert(profiles)
      .values({
        id: legendId,
        username: legendUsername,
        // نام نمایشی عمداً خالی می‌ماند تا نام‌کاربری نمایش داده شود؛
        // برچسب «سازنده» برای نقش legend در UI به‌صورت خودکار رندر می‌شود.
        displayName: null,
        role: "legend",
      })
      .onConflictDoNothing();
  }
}

seed()
  .then(() => {
    console.log("OffGrid seed completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("OffGrid seed failed:", error);
    process.exit(1);
  });
