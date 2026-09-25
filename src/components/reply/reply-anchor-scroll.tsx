"use client";

import { useEffect } from "react";

/**
 * وقتی صفحه با هش #reply-… باز شود (یا هش تغییر کند)،
 * آرام به همان پاسخ اسکرول می‌کند و هاله‌ی بنفشش را دو ثانیه روشن می‌کند.
 */
export function ReplyAnchorScroll() {
  useEffect(() => {
    let timeoutId: number | undefined;
    let currentEl: HTMLElement | null = null;

    function highlight() {
      const hash = window.location.hash;
      if (!hash.startsWith("#reply-")) return;
      const element = document.getElementById(hash.slice(1));
      if (!element) return;

      element.scrollIntoView({ behavior: "smooth", block: "center" });

      if (currentEl && currentEl !== element) {
        currentEl.classList.remove("reply-anchor-highlight");
      }
      currentEl = element;
      element.classList.add("reply-anchor-highlight");

      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        element.classList.remove("reply-anchor-highlight");
        if (currentEl === element) currentEl = null;
      }, 2000);
    }

    // صبر کوتاه تا DOM کامل رندر شده باشد
    const initialId = window.setTimeout(highlight, 250);
    window.addEventListener("hashchange", highlight);

    return () => {
      window.clearTimeout(initialId);
      window.clearTimeout(timeoutId);
      window.removeEventListener("hashchange", highlight);
    };
  }, []);

  return null;
}
