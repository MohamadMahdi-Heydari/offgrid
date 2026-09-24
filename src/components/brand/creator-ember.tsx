type CreatorEmberProps = {
  className?: string;
};

/**
 * «نگین سازنده» — نشان اختصاصی افسانه‌ی آفگرید کنار نام نمایشی.
 * معادل برندِ خودمان برای تیکِ تأیید، اما به زبان آتش:
 * حلقه‌ی ظریف آبیِ گرادیانی، شعله‌ی مینیاتوری سه‌پرِ نامتقارن
 * و هسته‌ی درخشانِ سفید در قلب شعله.
 *
 * تو سایز ۲۴px واضح و خودنماست و فقط کنار نام افسانه می‌نشیند.
 */
export function CreatorEmber({ className }: CreatorEmberProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <defs>
        {/* حلقه: آبی عمیق به آبی روشن */}
        <linearGradient id="creator-ember-ring" x1="4.5" y1="3.5" x2="19.5" y2="20.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
        {/* شعله: از پایه‌ی آبی به نوک روشن */}
        <linearGradient id="creator-ember-flame" x1="9" y1="16.5" x2="15.5" y2="6.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="55%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#93C5FD" />
        </linearGradient>
      </defs>

      {/* حلقه‌ی بیرونی نازک — نبض ملایم با کلاس ember-ring */}
      <circle
        className="ember-ring"
        cx="12"
        cy="12"
        r="8.6"
        stroke="url(#creator-ember-ring)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* شعله‌ی سه‌پرِ نامتقارن: نوک اصلی، پرِ راست بالا و پرِ چپِ پایین‌تر */}
      <path
        d="M12.2 6.2C12.9 8.2 14.1 9.2 14.6 11C14.9 10.4 15.5 9.9 16 9.3C16.5 10.9 16.3 12.7 15.1 14.2C14 15.6 12.4 16.3 10.7 15.9C9.1 15.5 8 14.3 8.1 12.7C8.15 11.9 8.5 11.2 9.1 10.6C9.3 11.3 9.8 11.8 10.6 12C10.2 10.4 10.7 7.9 12.2 6.2Z"
        fill="url(#creator-ember-flame)"
      />

      {/* هسته‌ی درخشان سفید */}
      <circle cx="12.1" cy="14.1" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}
