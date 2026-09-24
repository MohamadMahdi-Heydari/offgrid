"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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

/** هش deterministic — همان الگوریتم قبلی، پس جای ستاره‌ی تاپیک‌های فعلی تغییر نمی‌کند */
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

type Star = SkyTopic & {
  /** موقعیت کسری: همیشه توی بازه‌ی [۰٫۱، ۰٫۹] تا حداقل ۱۰٪ از لبه‌ها فاصله داشته باشد */
  fx: number;
  fy: number;
};

const EDGE = 0.1;

function buildStars(topics: SkyTopic[]): Star[] {
  return topics.map((topic) => ({
    ...topic,
    fx: EDGE + seededUnit(topic.id, 7) * (1 - EDGE * 2),
    fy: EDGE + seededUnit(topic.id, 29) * (1 - EDGE * 2),
  }));
}

/** غبار ستاره‌ای محوِ پس‌زمینه — ثابت و deterministic برای SSR */
const DUST = Array.from({ length: 26 }, (_, index) => ({
  fx: 0.03 + seededUnit("offgrid-sky-dust", index * 7 + 1) * 0.94,
  fy: 0.03 + seededUnit("offgrid-sky-dust", index * 7 + 40) * 0.94,
  r: 0.5 + seededUnit("offgrid-sky-dust", index * 7 + 80) * 0.9,
  opacity: 0.15 + seededUnit("offgrid-sky-dust", index * 7 + 120) * 0.3,
}));

/** ابعاد ستاره در پیکسل واقعی — کوچک و تیز؛ محبوبیت فقط درخشندگی را شدت می‌دهد */
const CORE_R = 3;
const SPARKLE_RAY = 6;
/** سقف هاله: اندازه‌ی کلی ستاره حتی برای محبوب‌ترین تاپیک ≤ ۲۴px */
const GLOW_R_CAP = 12;

type StarTier = {
  tierOpacity: number;
  glowR: number;
  glowOpacity: number;
  sparkleOpacity: number;
};

function starTier(likeCount: number): StarTier {
  if (likeCount >= 10) return { tierOpacity: 1, glowR: GLOW_R_CAP, glowOpacity: 0.55, sparkleOpacity: 0.95 };
  if (likeCount >= 6) return { tierOpacity: 1, glowR: 9.5, glowOpacity: 0.5, sparkleOpacity: 0.9 };
  if (likeCount >= 1) return { tierOpacity: 0.85, glowR: 8.5, glowOpacity: 0.42, sparkleOpacity: 0.75 };
  return { tierOpacity: 0.55, glowR: 7.5, glowOpacity: 0.35, sparkleOpacity: 0.5 };
}

/** چشمک‌زدن: مدت ۲ تا ۴ ثانیه و تأخیر شروع متفاوت — همه از seed ستاره */
function twinkleParams(topicId: string) {
  return {
    duration: 2 + seededUnit(topicId, 53) * 2,
    delay: seededUnit(topicId, 97) * 3,
  };
}

type PixelStar = Star & StarTier & { x: number; y: number; duration: number; delay: number };

type ConstellationLine = { key: string; x1: number; y1: number; x2: number; y2: number };

/**
 * خطوط صورت فلکی: فقط بین ستاره‌هایی که فاصله‌شان کمتر از ۲۵٪ عرض باکس است،
 * و هر ستاره حداکثر به ۲ همسایه وصل می‌شود تا خطوط از کنار هم رد نشود.
 */
function buildConstellation(stars: PixelStar[], boxWidth: number): ConstellationLine[] {
  const maxDistance = boxWidth * 0.25;
  const candidates: Array<ConstellationLine & { distance: number; aId: string; bId: string }> = [];

  for (let i = 0; i < stars.length; i += 1) {
    for (let j = i + 1; j < stars.length; j += 1) {
      const distance = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
      if (distance < maxDistance) {
        candidates.push({
          key: `${stars[i].id}:${stars[j].id}`,
          x1: stars[i].x,
          y1: stars[i].y,
          x2: stars[j].x,
          y2: stars[j].y,
          distance,
          aId: stars[i].id,
          bId: stars[j].id,
        });
      }
    }
  }

  candidates.sort((a, b) => a.distance - b.distance);

  const degree = new Map<string, number>();
  const kept: ConstellationLine[] = [];
  for (const candidate of candidates) {
    const degreeA = degree.get(candidate.aId) ?? 0;
    const degreeB = degree.get(candidate.bId) ?? 0;
    if (degreeA < 2 && degreeB < 2) {
      degree.set(candidate.aId, degreeA + 1);
      degree.set(candidate.bId, degreeB + 1);
      kept.push({ key: candidate.key, x1: candidate.x1, y1: candidate.y1, x2: candidate.x2, y2: candidate.y2 });
    }
  }
  return kept;
}

type PersonalSkyProps = {
  displayName: string;
  topics: SkyTopic[];
  isOwnProfile: boolean;
};

export function PersonalSky({ displayName, topics, isOwnProfile }: PersonalSkyProps) {
  const [hovered, setHovered] = useState<Star | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  /** اندازه‌ی واقعی باکس — چون SVG توی فضای پیکسلی کشیده می‌شود، دایره‌ها همیشه دایره می‌مانند */
  const [size, setSize] = useState({ width: 760, height: 300 });

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.width > 0 && rect.height > 0) {
        setSize({ width: rect.width, height: rect.height });
      }
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const stars = useMemo(() => buildStars(topics), [topics]);

  const pixelStars: PixelStar[] = useMemo(
    () =>
      stars.map((star) => ({
        ...star,
        ...starTier(star.likeCount),
        ...twinkleParams(star.id),
        x: Math.round(star.fx * size.width * 10) / 10,
        y: Math.round(star.fy * size.height * 10) / 10,
      })),
    [stars, size],
  );

  const lines = useMemo(() => buildConstellation(pixelStars, size.width), [pixelStars, size.width]);

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
            <div ref={boxRef} className="relative h-[200px] w-full sm:h-[300px]">
              <svg
                viewBox={`0 0 ${Math.round(size.width)} ${Math.round(size.height)}`}
                className="h-full w-full rounded-xl border border-white/5"
                role="img"
                aria-label={`آسمان ستاره‌های ${displayName}`}
              >
                <defs>
                  {/* هاله‌ی بنفش — گرادیان نسبی به هر دایره، پس با سقف شعاع سازگار است */}
                  <radialGradient id="offgrid-sky-glow">
                    <stop offset="0%" stopColor="#C084FC" stopOpacity="0.55" />
                    <stop offset="45%" stopColor="#A855F7" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* غبار ستاره‌ای محو */}
                {DUST.map((dust, index) => (
                  <circle
                    key={index}
                    cx={dust.fx * size.width}
                    cy={dust.fy * size.height}
                    r={dust.r}
                    fill="#8B7AB8"
                    opacity={dust.opacity}
                  />
                ))}

                {/* خطوط صورت فلکی — نازک، بنفش، ۲۰٪ شفافیت */}
                {lines.map((line) => (
                  <line
                    key={line.key}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#A855F7"
                    strokeOpacity={0.2}
                    strokeWidth={1}
                  />
                ))}

                {/* ستاره‌ها */}
                {pixelStars.map((star, index) => (
                  <motion.g
                    key={star.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: star.tierOpacity, scale: 1 }}
                    transition={{ delay: 0.15 + index * 0.06, type: "spring", stiffness: 320, damping: 18 }}
                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  >
                    <g
                      className="star-twinkle"
                      style={
                        {
                          "--tw-dur": `${star.duration.toFixed(2)}s`,
                          "--tw-delay": `${star.delay.toFixed(2)}s`,
                        } as CSSProperties
                      }
                    >
                      {/* هاله */}
                      <circle cx={star.x} cy={star.y} r={star.glowR} fill="url(#offgrid-sky-glow)" opacity={star.glowOpacity} />
                      {/* جرقه‌ی چهارپره */}
                      <path
                        d={`M${star.x - SPARKLE_RAY} ${star.y} H${star.x + SPARKLE_RAY} M${star.x} ${star.y - SPARKLE_RAY} V${star.y + SPARKLE_RAY}`}
                        stroke="#C084FC"
                        strokeWidth={1}
                        strokeLinecap="round"
                        opacity={star.sparkleOpacity}
                      />
                      {/* هسته‌ی تیز سفید-بنفش */}
                      <circle cx={star.x} cy={star.y} r={CORE_R} fill="#E9D5FF" />
                      {/* حلقه‌ی هاور */}
                      {hovered?.id === star.id ? (
                        <circle cx={star.x} cy={star.y} r={9} fill="none" stroke="#C084FC" strokeOpacity={0.6} strokeWidth={1} />
                      ) : null}
                    </g>
                  </motion.g>
                ))}
              </svg>

              {/* لایه‌ی تعامل: هاور + کلیک روی همان جای ستاره‌ها */}
              {stars.map((star) => (
                <Link
                  key={star.id}
                  href={`/t/${star.id}`}
                  aria-label={`${star.title} — ${star.likeCount} فانوس`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400"
                  style={{ insetInlineStart: `${star.fx * 100}%`, top: `${star.fy * 100}%`, width: 30, height: 30 }}
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
                    insetInlineStart: `${Math.min(Math.max(hovered.fx * 100, 16), 84)}%`,
                    top: `${hovered.fy * 100}%`,
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
