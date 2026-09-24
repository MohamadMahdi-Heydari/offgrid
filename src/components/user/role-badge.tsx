import { GuardianShield } from "@/components/brand/guardian-shield";
import { NetworkGear } from "@/components/brand/network-gear";
import { CreatorEmber } from "@/components/brand/creator-ember";

const BADGES = {
  moderator: {
    label: "ناظر",
    Icon: GuardianShield,
    tone: "border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]",
  },
  admin: {
    label: "ادمین",
    Icon: NetworkGear,
    tone: "border-[#F97316]/40 bg-[#F97316]/10 text-[#F97316]",
  },
  legend: {
    label: "سازنده",
    Icon: CreatorEmber,
    tone: "border-[#3B82F6]/40 bg-[#3B82F6]/10 text-[#3B82F6]",
  },
} as const;

type RoleBadgeProps = {
  role: string | null | undefined;
  size?: "sm" | "md";
};

/** بج رنگی نقش — برای نقش user هیچی رندر نمی‌کند. */
export function RoleBadge({ role, size = "sm" }: RoleBadgeProps) {
  if (!role || role === "user") return null;
  const badge = BADGES[role as keyof typeof BADGES];
  if (!badge) return null;

  const sizeCls =
    size === "md"
      ? "gap-1.5 px-2.5 py-1 text-xs [&_svg]:h-4 [&_svg]:w-4"
      : "gap-1 px-2 py-0.5 text-[11px] [&_svg]:h-3 [&_svg]:w-3";

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${badge.tone} ${sizeCls}`}>
      <badge.Icon />
      {badge.label}
    </span>
  );
}
