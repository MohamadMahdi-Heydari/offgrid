import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CategoryNavItem } from "@/lib/forum-data";

export function CategoryNav({ items, activeSlug }: { items: CategoryNavItem[]; activeSlug?: string }) {
  return (
    <section className="mt-4 overflow-x-auto pb-2">
      <div className="flex min-w-max items-center gap-2">
        {items.map((category) => {
          const isActive = category.slug === activeSlug;

          return (
            <Link
              key={category.id}
              href={`/c/${category.slug}`}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-all duration-200",
                isActive
                  ? "border-purple-400/70 bg-purple-500/20 text-purple-100"
                  : "border-white/10 bg-zinc-900/70 text-zinc-300 hover:border-purple-400/60 hover:text-purple-200",
              )}
            >
              <span className="ms-1">{category.icon ?? "#"}</span>
              {category.name}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
