import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Header } from "@/components/layout/header";
import { getOrderedCategories } from "@/lib/forum-data";
import { CategoriesProvider } from "@/components/layout/categories-provider";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "OffGrid | آفگرید",
  description: "از شبکه جدا شو، به بحث بپیوند",
};

function HeaderSkeleton() {
  return <div className="h-16 border-b border-[var(--border)] bg-[color:var(--background)]/80" />;
}

function PageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="h-28 animate-pulse rounded-3xl border border-[var(--border)] bg-zinc-900/50" />
      <div className="mt-4 h-10 animate-pulse rounded-xl border border-[var(--border)] bg-zinc-900/40" />
      <div className="mt-4 h-40 animate-pulse rounded-2xl border border-[var(--border)] bg-zinc-900/40" />
    </main>
  );
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const categories = await getOrderedCategories();

  return (
    <html lang="fa-IR" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} min-h-screen bg-[var(--background)] text-[color:var(--text-primary)] antialiased`}>
        <ThemeProvider>
          <CategoriesProvider categories={categories}>
            <Suspense fallback={<HeaderSkeleton />}>
              <Header />
            </Suspense>
            <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
          </CategoriesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
