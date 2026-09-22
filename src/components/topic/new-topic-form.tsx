"use client";

import { useMemo, useState } from "react";
import { createTopicAction } from "@/app/actions/forum";
import type { CategoryNavItem } from "@/lib/forum-data";

type NewTopicFormProps = {
  categories: CategoryNavItem[];
  defaultCategorySlug?: string;
};

export function NewTopicForm({ categories, defaultCategorySlug }: NewTopicFormProps) {
  const initialCategory = useMemo(() => {
    if (!defaultCategorySlug) return categories[0]?.id ?? "";
    return categories.find((category) => category.slug === defaultCategorySlug)?.id ?? categories[0]?.id ?? "";
  }, [categories, defaultCategorySlug]);

  const [type, setType] = useState<"discussion" | "question">("discussion");
  const [title, setTitle] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const tags = tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 5);

  return (
    <form action={createTopicAction} className="mt-6 space-y-5">
      <div>
        <p className="mb-2 text-sm text-zinc-300">نوع تاپیک</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-200">
            <input
              name="type"
              value="discussion"
              type="radio"
              checked={type === "discussion"}
              onChange={() => setType("discussion")}
              className="me-2"
            />
            بحث 💬
          </label>
          <label className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-200">
            <input
              name="type"
              value="question"
              type="radio"
              checked={type === "question"}
              onChange={() => setType("question")}
              className="me-2"
            />
            سوال 🎯
          </label>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-300" htmlFor="category_id">
          دسته
        </label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={initialCategory}
          required
          className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon ? `${category.icon} ` : ""}
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-300" htmlFor="title">
          عنوان
        </label>
        <input
          id="title"
          name="title"
          type="text"
          minLength={5}
          maxLength={150}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
          placeholder="عنوان دقیق و روشن بنویس"
        />
        <p className="mt-1 text-xs text-zinc-500">{title.length}/150</p>
      </div>

      {type === "question" ? (
        <div>
          <label className="mb-2 block text-sm text-zinc-300" htmlFor="question_context">
            توضیح سوال
          </label>
          <textarea
            id="question_context"
            name="question_context"
            rows={4}
            required
            placeholder="به چه چیزی نیاز داری؟ چرا مهمه؟ چه تلاشی کردی؟"
            className="w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
          />
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm text-zinc-300" htmlFor="body">
          متن
        </label>
        <textarea
          id="body"
          name="body"
          rows={10}
          required
          className="w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
          placeholder="متن تاپیک را با Markdown بنویس..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-300" htmlFor="tags">
          تگ‌ها
        </label>
        <input
          id="tags"
          name="tags"
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
          placeholder="مثلاً: بحث, آموزش, سوال"
          className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-zinc-100 outline-none focus:ring-2 focus:ring-purple-500/60"
        />
        <p className="mt-1 text-xs text-zinc-500">حداکثر ۵ تگ — الان: {tags.length}</p>
      </div>

      <button
        type="submit"
        className="inline-flex h-11 items-center rounded-xl bg-purple-500 px-5 text-sm font-medium text-white transition-all duration-200 hover:bg-purple-600 active:scale-[0.98]"
      >
        ذخیره تاپیک
      </button>
    </form>
  );
}
