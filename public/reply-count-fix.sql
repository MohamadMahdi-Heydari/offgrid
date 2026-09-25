-- شمارش پاسخ ممکن است به‌خاطر داده‌های قدیمی یا دست‌کاری مستقیم SQL از واقعیت جلوتر مانده باشد.
-- این فایل فقط یک‌بار شمارنده‌ها را با داده‌ی فعِال (is_deleted = false) بازنویسی می‌کند.
-- منطقِ کم کردن شمارنده روی حذف نرم (is_deleted) با مایگریشن 0004 روی dab ترتیبی سالم است —
-- این اسکریپت هرگز نباید همان work را دوباره یا سه‌بار تکرار کند.

-- بازنویسی reply_count تاپیک‌ها
update public.topics t
set reply_count = (
  select count(*)
  from public.replies r
  where r.topic_id = t.id
    and r.is_deleted = false
);

-- بازنویسی reply_count پاسخ‌های والد (پاسخ‌های تودرتو)
update public.replies p
set reply_count = (
  select count(*)
  from public.replies c
  where c.parent_id = p.id
    and c.is_deleted = false
);
