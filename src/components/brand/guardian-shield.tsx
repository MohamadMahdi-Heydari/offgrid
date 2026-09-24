type GuardianShieldProps = {
  className?: string;
};

/**
 * «سپر نگهبان» — نشان اختصاصی ناظران آفگرید.
 * سپری با گوشه‌های نرم و نوکِ کمی نامتقارن که حس زره‌ی دست‌ساز می‌دهد،
 * شعله‌ی نگهبانی کوچک در مرکز (نگهبانی که چشمش به آتش بحث است)
 * و دو پُرچِ زره در بالای سپر.
 */
export function GuardianShield({ className }: GuardianShieldProps) {
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
      {/* بدنه‌ی سپر */}
      <path d="M8.2 4.4C9.6 3.6 14.4 3.6 15.8 4.4C18.5 5.9 18.9 6.3 19 8.4C19.2 13 17.4 17 12.6 19.6C8 17.2 4.8 13.6 5 8.6C5.1 6.4 5.9 5.5 8.2 4.4Z" />

      {/* شعله‌ی نگهبانی در مرکز */}
      <path d="M12.1 8.7C12.6 10 13.5 10.8 13.8 12.1C14.1 13.7 13.3 15.2 11.9 15.6C10.7 15.9 9.5 15.1 9.2 13.9C9 13 9.3 12.2 9.9 11.6C10.1 12 10.5 12.3 11 12.4C10.6 11.3 11 9.7 12.1 8.7Z" />

      {/* پُرچ‌های زره */}
      <circle cx={7.5} cy={7.2} r={0.7} fill="currentColor" stroke="none" />
      <circle cx={16.5} cy={7.2} r={0.7} fill="currentColor" stroke="none" />
    </svg>
  );
}
