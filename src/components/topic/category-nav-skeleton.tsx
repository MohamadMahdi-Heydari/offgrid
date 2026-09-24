/** اسکلت نوار دسته‌بندی‌ها */
export function CategoryNavSkeleton() {
  return (
    <div className="mt-4 flex animate-pulse flex-wrap gap-2" aria-hidden="true">
      {[52, 80, 64, 92, 60, 74].map((width, index) => (
        <div key={index} className="h-9 rounded-xl bg-zinc-900/60" style={{ width }} />
      ))}
    </div>
  );
}
