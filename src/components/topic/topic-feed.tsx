"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCheck, MessageCircle, Pin, Tag } from "lucide-react";

type TopicItem = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  roleEmoji: string;
  likeCount: number;
  replyCount: number;
  createdAtLabel: string;
  category: string;
  categorySlug: string;
  tags: string[];
  pinned: boolean;
  solved: boolean;
};

export function TopicFeed({ topics }: { topics: TopicItem[] }) {
  if (topics.length === 0) {
    return (
      <section className="mt-4 rounded-2xl border border-dashed border-white/15 bg-[color:var(--surface)]/50 p-10 text-center">
        <p className="text-lg font-semibold text-zinc-100">هنوز تاپیکی نیست، اولین نفر باش</p>
        <p className="mt-2 text-sm text-zinc-400">با ساخت اولین تاپیک، گفت‌وگوی این بخش را شروع کن.</p>
      </section>
    );
  }

  return (
    <section className="mt-4 space-y-4">
      {topics.map((topic, index) => (
        <motion.article
          key={topic.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.04 }}
          className="rounded-2xl border border-[var(--border)] bg-[color:var(--surface)]/70 p-6 transition-colors duration-200 hover:bg-[color:var(--surface)]"
        >
          <div className="flex gap-4">
            <div className="flex min-w-16 flex-col items-center justify-center rounded-xl border border-white/10 bg-zinc-950/70 px-2 py-3 text-center">
              <button type="button" aria-label="لایک" className="text-purple-300 hover:text-purple-200">
                ▲
              </button>
              <span className="my-1 text-sm font-semibold text-zinc-100">{topic.likeCount}</span>
              <button type="button" aria-label="دیسلایک" className="text-zinc-500 hover:text-red-400">
                ▼
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <Link href={`/c/${topic.categorySlug}`} className="hover:text-purple-300">
                  {topic.category}
                </Link>
                <span>•</span>
                <span>
                  {topic.roleEmoji ? `${topic.roleEmoji} ` : ""}@{topic.author}
                </span>
                <span>•</span>
                <span>{topic.createdAtLabel}</span>
              </div>

              <Link href={`/t/${topic.id}`} className="group block">
                <h2 className="text-xl font-bold text-zinc-50 transition-colors group-hover:text-purple-300">{topic.title}</h2>
                <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-zinc-300">{topic.excerpt}</p>
              </Link>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {topic.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex min-w-20 flex-col items-end gap-2 text-zinc-400">
              <span className="inline-flex items-center gap-1 text-sm">
                <MessageCircle className="h-4 w-4" /> {topic.replyCount}
              </span>
              {topic.pinned ? (
                <span className="inline-flex items-center gap-1 text-xs text-purple-300">
                  <Pin className="h-3.5 w-3.5" /> سنجاق‌شده
                </span>
              ) : null}
              {topic.solved ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCheck className="h-3.5 w-3.5" /> حل‌شده
                </span>
              ) : null}
            </div>
          </div>
        </motion.article>
      ))}
    </section>
  );
}
