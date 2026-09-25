"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCheck, Flame, MessageCircle, Pin, Tag } from "lucide-react";
import { OffgridLantern } from "@/components/brand/offgrid-lantern";
import { EmptyState } from "@/components/ui/empty-state";
import { RoleBadge } from "@/components/user/role-badge";

type TopicItem = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  likeCount: number;
  replyCount: number;
  createdAtLabel: string;
  category: string;
  categorySlug: string;
  tags: string[];
  pinned: boolean;
  solved: boolean;
};

export type FeedEmptyState = {
  /** پیام اصلی حالت خالی */
  title: string;
  description?: string;
  /** بدون actionHref/actionLabel دکمه‌ای نمایش داده نمی‌شود */
  actionHref?: string;
  actionLabel?: string;
};

const DEFAULT_EMPTY_STATE: FeedEmptyState = {
  title: "هنوز تاپیکی نیست. اولین فانوس رو روشن کن.",
  description: "با ساخت اولین تاپیک، گفت‌وگوی این بخش را شروع کن.",
  actionHref: "/new",
  actionLabel: "ساخت تاپیک",
};

export function TopicFeed({ topics, emptyState }: { topics: TopicItem[]; emptyState?: FeedEmptyState }) {
  const router = useRouter();

  if (topics.length === 0) {
    const empty = emptyState ?? DEFAULT_EMPTY_STATE;
    return (
      <EmptyState
        icon={Flame}
        title={empty.title}
        description={empty.description}
        actionHref={empty.actionHref}
        actionLabel={empty.actionLabel}
      />
    );
  }

  return (
    <section className="mt-4 space-y-4">
      {topics.map((topic, index) => (
        <Link key={topic.id} href={`/t/${topic.id}`} className="block">
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            className="group/article rounded-2xl border border-transparent bg-[color:var(--surface)]/70 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-400/40 hover:bg-[color:var(--surface)]"
          >
            <div className="flex gap-4">
              {/* ستون فانوس — کلیک روش همان کلیک کارت است */}
              <span className="flex min-w-16 flex-col items-center justify-center gap-0.5 rounded-xl border border-white/10 bg-zinc-950/70 px-2 py-3 text-center transition-colors group-hover/article:border-purple-400/40">
                <span className="text-purple-300/90 transition-colors group-hover/article:text-purple-200">
                  <OffgridLantern lit={topic.likeCount > 0} tone="purple" size={15} />
                </span>
                <span className="my-0.5 text-sm font-semibold text-zinc-100">{topic.likeCount}</span>
                <span className="rotate-180 text-zinc-600 transition-colors group-hover/article:text-red-400/80">
                  <OffgridLantern tone="red" size={15} />
                </span>
              </span>

              {/* محتوای اصلی */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <span
                    role="link"
                    tabIndex={0}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      router.push(`/c/${topic.categorySlug}`);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        router.push(`/c/${topic.categorySlug}`);
                      }
                    }}
                    className="cursor-pointer transition-colors hover:text-purple-300"
                  >
                    {topic.category}
                  </span>
                  <span>•</span>
                  <RoleBadge role={topic.authorRole} size="sm" />
                  <span>@{topic.author}</span>
                  <span>•</span>
                  <span>{topic.createdAtLabel}</span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-zinc-50 transition-colors group-hover/article:text-purple-300">{topic.title}</h2>
                  <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-zinc-300">{topic.excerpt}</p>
                </div>

                {/* جایگاه درست تگ‌ها: بعد از excerpt، قبل از فوتر — حداکثر ۳ تگ، مابقی «+۲» */}
                {topic.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {topic.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                    {topic.tags.length > 3 ? (
                      <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200">
                        +{(topic.tags.length - 3).toLocaleString("fa-IR")}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {/* pill پاسخ: فقط یک‌بار، پایین کارت — کلیک → #replies یا #reply-form */}
                <div className="mt-3 flex flex-nowrap">
                  <Link
                    href={`/t/${topic.id}${topic.replyCount > 0 ? "#replies" : "#reply-form"}`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      router.push(`/t/${topic.id}${topic.replyCount > 0 ? "#replies" : "#reply-form"}`);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-400 transition-all hover:border-purple-400/40 hover:bg-purple-500/10 hover:text-purple-200"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {topic.replyCount > 0 ? `${topic.replyCount.toLocaleString("fa-IR")} پاسخ` : "اولین نظر رو بنویس"}
                  </Link>
                </div>
              </div>

              {/* آمار کناری: فقط علائم وضعیت تاپیک — عدد پاسخ به pill منتقل شد */}
              <div className="flex min-w-20 flex-col items-end gap-2 text-zinc-400">
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
        </Link>
      ))}
    </section>
  );
}
