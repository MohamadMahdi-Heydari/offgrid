"use client";

import { createContext, useContext } from "react";
import type { CategoryNavItem } from "@/lib/forum-data";

const CategoriesContext = createContext<CategoryNavItem[]>([]);

export function CategoriesProvider({
  categories,
  children,
}: {
  categories: CategoryNavItem[];
  children: React.ReactNode;
}) {
  return <CategoriesContext.Provider value={categories}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  return useContext(CategoriesContext);
}
