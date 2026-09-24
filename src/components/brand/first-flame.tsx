type FirstFlameProps = {
  className?: string;
};

/**
 * «شعله‌ی نخست» — نشان اختصاصی سازنده‌ی آفگرید؛
 * کسی که اولین آتش را روشن کرد.
 *
 * شعله‌ی نامتقارن با قوس S ظریف در سمت چپ (مثل شعله‌ای که باد پیچانده)،
 * هسته‌ی پرِ درخشان در قلب شعله (جرقه‌ی اولیه) و دو جرقه‌ی چهارپرِ
 * شناور بالای سمت راست (گسترش).
 *
 * رنگ از currentColor می‌آید تا با زمینه‌ی بج سازگار شود.
 */
export function FirstFlame({ className }: FirstFlameProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* بدنه‌ی شعله با قوس S در سمت چپ */}
      <path d="M12.8 2.8C13.1 6.2 15.3 7.4 16.3 9.9C17.6 13.2 16.4 17.4 12.7 18.4C10.3 19.1 7.7 17.9 6.9 15.3C6.3 13.4 6.9 11.6 8.1 10.2C8.5 11.2 9.2 11.8 10.1 12.05C9.5 9.4 10.1 5.6 12.8 2.8Z" />

      {/* هسته‌ی پر — «جرقه‌ی اولیه»؛ نبض ملایم با کلاس flame-core */}
      <circle className="flame-core" cx={12.4} cy={14.8} r={1.7} fill="currentColor" stroke="none" />

      {/* دو جرقه‌ی چهارپر شناور — «گسترش» */}
      <g strokeWidth={1.2}>
        <path d="M17.2 3.2v2.4M16 4.4h2.4" />
        <path d="M19.6 6.6v1.6M18.8 7.4h1.6" />
      </g>
    </svg>
  );
}
