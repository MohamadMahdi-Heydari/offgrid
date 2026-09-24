import { useId } from "react";

export type LanternTone = "purple" | "red";

type OffgridLanternProps = {
  /** فانوس روشن است؟ */
  lit?: boolean;
  /** رنگ شعله: بنفش (لایک) یا قرمز (دیسلایک) */
  tone?: LanternTone;
  /** عرض SVG به پیکسل */
  size?: number;
  className?: string;
  title?: string;
};

const TONE_COLORS: Record<
  LanternTone,
  { flameTop: string; flameMid: string; flameBase: string; halo: string }
> = {
  purple: {
    flameTop: "#F3E8FF",
    flameMid: "#C084FC",
    flameBase: "#A855F7",
    halo: "#A855F7",
  },
  red: {
    flameTop: "#FEE2E2",
    flameMid: "#F87171",
    flameBase: "#EF4444",
    halo: "#EF4444",
  },
};

/**
 * فانوس آفگرید — نماد واکنش مثبت/منفی انجمن.
 * در حالت روشن، شعله‌ای با glow برند لرزش (flicker) دارد؛ انیمیشن‌ها در globals.css تعریف شده‌اند.
 */
export function OffgridLantern({ lit = false, tone = "purple", size = 26, className = "", title }: OffgridLanternProps) {
  const gradientId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const colors = TONE_COLORS[tone];
  const height = Math.round(size * (64 / 48));

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 48 64"
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={`lantern-svg shrink-0 transition-[filter,color] duration-300 ${lit ? "lantern-lit" : ""} ${className}`.trim()}
      style={
        lit
          ? { filter: `drop-shadow(0 0 7px ${colors.halo}59) drop-shadow(0 0 20px ${colors.halo}2E)` }
          : undefined
      }
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={`${gradientId}-flame`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.flameTop} />
          <stop offset="55%" stopColor={colors.flameMid} />
          <stop offset="100%" stopColor={colors.flameBase} />
        </linearGradient>
        <radialGradient id={`${gradientId}-halo`}>
          <stop offset="0%" stopColor={colors.halo} stopOpacity="0.5" />
          <stop offset="60%" stopColor={colors.halo} stopOpacity="0.16" />
          <stop offset="100%" stopColor={colors.halo} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* حلقه آویز */}
      <circle cx="24" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M24 11 L24 14.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />

      {/* کلاهک فانوس */}
      <path d="M15.5 19.5 Q24 12.8 32.5 19.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="15" y="19.3" width="18" height="3.4" rx="1.7" fill="currentColor" />

      {/* محفظه شیشه‌ای */}
      <rect
        x="15.5"
        y="25"
        width="17"
        height="25"
        rx="5.5"
        stroke="currentColor"
        strokeWidth="2"
        fill={lit ? `url(#${gradientId}-halo)` : "rgba(148, 163, 184, 0.05)"}
      />

      {/* شعله */}
      <g className="lantern-flame" opacity={lit ? 1 : 0} style={{ transition: "opacity 0.35s ease" }}>
        <path
          d="M24 30.5 C21.8 33.6 20.6 34.8 20.6 37.6 a3.4 3.4 0 0 0 6.8 0 C27.4 34.8 26.2 33.6 24 30.5 Z"
          fill={`url(#${gradientId}-flame)`}
        />
      </g>

      {/* فتیله */}
      <rect x="22.6" y="42.5" width="2.8" height="4.5" rx="1.4" fill="currentColor" />

      {/* پایه و پایه‌های فانوس */}
      <rect x="13.5" y="50" width="21" height="4.6" rx="2.3" fill="currentColor" />
      <path d="M17 54.6 L17 57.5 M31 54.6 L31 57.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
