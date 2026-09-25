"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type ReplyCardLinkProps = {
  href: string;
  children: ReactNode;
};

/**
 * کلیک روی هر جای کارت پاسخ (به‌جز ناحیه‌ی دکمه‌ها با data-reply-nolink)
 * به انکر همان پاسخ در صفحه‌ی تاپیک می‌رود.
 */
export function ReplyCardLink({ href, children }: ReplyCardLinkProps) {
  const router = useRouter();

  function navigate() {
    router.push(href, { scroll: false });
  }

  return (
    <div
      role="link"
      tabIndex={-1}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("[data-reply-nolink]")) return;
        navigate();
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate();
        }
      }}
      className="cursor-pointer"
    >
      {children}
    </div>
  );
}
