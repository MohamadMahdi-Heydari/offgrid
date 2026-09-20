import Link from "next/link";

type OffgridLogoProps = {
  compact?: boolean;
};

export function OffgridLogo({ compact = false }: OffgridLogoProps) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="رفتن به صفحه اصلی آفگرید">
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <g fill="#A855F7">
          <circle cx="10" cy="10" r="3.2" />
          <circle cx="22" cy="10" r="3.2" />
          <circle cx="34" cy="10" r="3.2" />
          <circle cx="10" cy="22" r="3.2" />
          <circle cx="34" cy="22" r="3.2" />
          <circle cx="10" cy="34" r="3.2" />
          <circle cx="22" cy="34" r="3.2" />
          <circle cx="34" cy="34" r="3.2" />
          <circle cx="30" cy="14" r="3.4" />
        </g>
        <path
          d="M22 22 L26.7 17.3"
          stroke="#A1A1AA"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="3 3"
        />
      </svg>

      {!compact && (
        <div className="leading-tight">
          <p className="text-xl font-extrabold tracking-wide text-[color:var(--text-primary)] transition-colors group-hover:text-purple-300">
            OffGrid
          </p>
          <p className="text-xs text-zinc-400">از شبکه جدا شو، به بحث بپیوند</p>
        </div>
      )}
    </Link>
  );
}
