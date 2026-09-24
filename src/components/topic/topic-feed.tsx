"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCheck, Flame, MessageCircle, Pin, Tag } from "lucide-react";
import { OffgridLantern } from "@/components/brand/offgrid-lantern";
import { EmptyState } from "@/components/ui/empty-state";

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
      <EmptyState
        icon={Flame}
        title="هنوز تاپیکی نیست. اولین فانوس رو روشن کن."
        description="با ساخت اولین تاپیک، گفت‌وگوی این بخش را شروع کن."
        actionHref="/new"
        actionLabel="ساخت تاپیک"
      />
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
          className="rounded-2xl border border-transparent bg-[color:var(--surface)]/70 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border)] hover:bg-[color:var(--surface)]"
        >
          <div className="flex gap-4">
            <Link
              href={`/t/${topic.id}`}
              title="مشاهده تاپیک و روشن کردن فانوس"
              className="group/lantern flex min-w-16 flex-col items-center justify-center gap-0.5 rounded-xl border border-white/10 bg-zinc-950/70 px-2 py-3 text-center transition-colors hover:border-purple-400/40"
            >
              <span className="text-purple-300/90 transition-colors group-hover/lantern:text-purple-200">
                <OffgridLantern lit={topic.likeCount > 0} tone="purple" size={15} />
              </span>
              <span className="my-0.5 text-sm font-semibold text-zinc-100">{topic.likeCount}</span>
              <span className="rotate-180 text-zinc-600 transition-colors group-hover/lantern:text-red-400/80">
                <OffgridLantern tone="red" size={15} />
              </span>
            </Link>

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
