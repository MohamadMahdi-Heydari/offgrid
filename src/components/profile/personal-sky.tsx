"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles, TrendingUp } from "lucide-react";

export type SkyTopic = {
  id: string;
  title: string;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  solved: boolean;
  categoryName: string;
};

type StarPlacement = SkyTopic & {
  x: number;
  y: number;
  size: number;
  opacity: number;
  bright: boolean;
};

/** هش deterministic ساده برای جای‌گذاری پایدار ستاره‌ها */
function hashString(input: string): number {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }
  return Math.abs(hash);
}

function seededUnit(topicId: string, salt: number): number {
  const seed = hashString(`${topicId}:${salt}`);
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** درخشندگی نمایی — مقیاس لایک سریع اشباع نمی‌شود */
function glowLevel(likeCount: number) {
  const score = Math.log2(Math.max(0, likeCount) + 1);
  const opacity = Math.min(0.5 + score * 0.16, 1);
  const size = 2 + Math.min(score, 5) * 0.9;
  return { opacity, size: Math.round(size * 10) / 10, bright: likeCount > 5, medium: likeCount >= 1 && likeCount <= 5 };
}

function nebulaColor(likeCount: number) {
  if (likeCount > 5) return "#A855F7";
  if (likeCount >= 1) return "#C084FC";
  return "#9D8AC8";
}

function buildSky(topics: SkyTopic[]) {
  const PADDING = 10;
  return topics.map((topic) => {
    const x = PADDING + seededUnit(topic.id, 7) * (100 - PADDING * 2);
    const y = PADDING + seededUnit(topic.id, 29) * (100 - PADDING * 2);
    const glow = glowLevel(topic.likeCount);
    return { ...topic, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, size: glow.size, opacity: glow.opacity, bright: glow.bright };
  }) as StarPlacement[];
}

function constellationLines(stars: StarPlacement[], maxDistance = 30) {
  const pairs: Array<{ a: StarPlacement; b: StarPlacement; distance: number }> = [];
  for (let i = 0; i < stars.length; i += 1) {
    for (let j = i + 1; j < stars.length; j += 1) {
      const dx = stars[i].x - stars[j].x;
      const dy = stars[i].y - stars[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= maxDistance) {
        pairs.push({ a: stars[i], b: stars[j], distance });
      }
    }
  }
  // فقط چند تا از نزدیک‌ترین جفت‌ها، تا شلوغ نشود
  pairs.sort((a, b) => a.distance - b.distance);
  return pairs.slice(0, Math.max(stars.length - 1, 0) + 2);
}

type PersonalSkyProps = {
  displayName: string;
  topics: SkyTopic[];
  isOwnProfile: boolean;
};

export function PersonalSky({ displayName, topics, isOwnProfile }: PersonalSkyProps) {
  const [hovered, setHovered] = useState<StarPlacement | null>(null);
  const stars = buildSky(topics);
  const lines = stars.length > 1 ? constellationLines(stars) : [];
  const totalLikes = topics.reduce((sum, topic) => sum + topic.likeCount, 0);
  const brightest = topics.length > 0 ? topics.reduce((max, topic) => (topic.likeCount > max.likeCount ? topic : max)).likeCount : 0;

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-b from-purple-950/40 via-[#0A0512] to-black">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-50 sm:text-xl">
            <Sparkles className="h-5 w-5 text-purple-300" aria-hidden="true" />
            آسمان {displayName}
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            هر تاپیک یک ستاره است؛ هرچه روشن‌تر، فانوس‌های بیشتری روشنش کرده‌اند.
          </p>
        </div>
        <span className="rounded-full border border-purple-400/25 bg-purple-500/10 px-3 py-1 text-xs text-purple-200">
          {topics.length > 0 ? `${topics.length} ستاره · ${totalLikes} فانوس` : "آسمان تاریک"}
        </span>
      </div>

      {topics.length === 0 ? (
        <div className="relative mx-4 mt-4 mb-4 flex h-[300px] flex-col items-center justify-center rounded-xl sm:mx-5">
          {/* چند ستاره‌ی بسیار کم‌نور در آسمان تاریک */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-xl">
            {[22, 68, 41, 85, 12].map((x, index) => (
              <span
                key={index}
                className="absolute h-1 w-1 rounded-full bg-zinc-600/40"
                style={{ insetInlineStart: `${x}%`, top: `${[18, 55, 80, 30, 70][index]}%` }}
              />
            ))}
          </div>
          <Flame className="relative h-8 w-8 text-zinc-600" aria-hidden="true" />
          <p className="relative mt-3 text-sm text-zinc-500">آسمانت هنوز خالیه. اولین ستاره رو روشن کن.</p>
          {isOwnProfile ? (
            <Link
              href="/new"
              className="relative mt-4 inline-flex h-10 items-center rounded-xl bg-purple-500 px-4 text-sm font-medium text-white transition-all duration-200 hover:bg-purple-600 active:scale-[0.98]"
            >
              تاپیک جدید
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          <div className="relative mx-4 mt-4 sm:mx-5">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="h-[128px] w-full rounded-xl border border-white/5 sm:h-[300px]"
              role="img"
              aria-label={`آسمان ستاره‌های ${displayName}`}
            >
              {/* خطوط صورت فلکی */}
              {lines.map(({ a, b }) => (
                <line
                  key={`${a.id}-${b.id}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#7C3AED"
                  strokeWidth={0.6 / 3}
                  strokeOpacity={0.28}
                  vectorEffect="non-scaling-stroke"
                  style={{ strokeWidth: 0.35 }}
                />
              ))}

              {/* ستاره‌ها */}
              {stars.map((star, index) => (
                <g key={star.id}>
                  {star.bright ? (
                    <circle cx={star.x} cy={star.y} r={star.size * 2.6} fill="#A855F7" opacity={0.12} />
                  ) : null}
                  <motion.circle
                    cx={star.x}
                    cy={star.y}
                    r={Math.max(star.size * 2.4, 5.5)}
                    fill={nebulaColor(star.likeCount)}
                    fillOpacity={0.28}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: hovered?.id === star.id ? 0.4 : 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  />
                  {star.bright ? (
                    <motion.circle
                      cx={star.x}
                      cy={star.y}
                      r={star.size * 1.8}
                      fill="none"
                      stroke="#C084FC"
                      strokeWidth={0.25}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, 0.6, 0.25, 0.6, 0.25], scale: 1 }}
                      transition={{ delay: 0.08 * index + 0.45, duration: 3.2, repeat: Infinity }}
                      style={{ transformBox: "fill-box", transformOrigin: "center" }}
                    />
                  ) : null}
                  <motion.circle
                    cx={star.x}
                    cy={star.y}
                    r={star.size}
                    fill={star.likeCount >= 1 ? "#E9D5FF" : "#C4B5FD"}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: star.opacity, scale: 1 }}
                    transition={{ delay: 0.08 * index + 0.2, type: "spring", stiffness: 380, damping: 16 }}
                    style={{ transformBox: "fill-box", transformOrigin: "center", filter: star.bright ? "drop-shadow(0 0 3px rgba(168,85,247,0.9))" : undefined }}
                  />
                </g>
              ))}
            </svg>

            {/* لایه‌ی تعامل: هاور + کلیک روی همان جای ستاره‌ها */}
            {stars.map((star) => (
              <Link
                key={star.id}
                href={`/t/${star.id}`}
                aria-label={`${star.title} — ${star.likeCount} فانوس`}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400"
                style={{ insetInlineStart: `${star.x}%`, top: `${star.y}%`, width: 30, height: 30 }}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(star)}
                onBlur={() => setHovered(null)}
              />
            ))}

            {/* تولتیپ */}
            {hovered ? (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-purple-400/30 bg-zinc-950/95 px-3 py-1.5 text-xs text-zinc-100 shadow-lg shadow-black/50 backdrop-blur-sm"
                style={{
                  insetInlineStart: `${Math.min(Math.max(hovered.x, 16), 84)}%`,
                  top: `${hovered.y}%`,
                  marginTop: -14,
                }}
              >
                <span className="block max-w-[220px] truncate font-medium">{hovered.title}</span>
                <span className="mt-0.5 block text-[10px] text-purple-300">
                  {hovered.likeCount} فانوس · {hovered.replyCount} پاسخ{hovered.solved ? " · حل‌شده ✓" : ""}
                </span>
              </div>
            ) : null}
          </div>

          {/* آمار پایین آسمان */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 pb-4 pt-3 text-xs text-zinc-500 sm:px-5">
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-purple-400/70" aria-hidden="true" />
              درخشان‌ترین ستاره: {brightest} فانوس
            </span>
            <span>مجموع نور: {totalLikes} فانوس</span>
            <span>پاسخ‌ها: {topics.reduce((sum, topic) => sum + topic.replyCount, 0)}</span>
          </div>
        </>
      )}
    </section>
  );
}
