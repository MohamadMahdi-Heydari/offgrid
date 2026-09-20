begin;

insert into public.categories (name, slug, description, icon, "order")
values
  ('عمومی', 'general', 'گفت‌وگوهای عمومی آفگرید', '📁', 1),
  ('فناوری', 'technology', 'اخبار و بحث‌های فناوری', '💻', 2),
  ('برنامه‌نویسی', 'programming', 'کدنویسی، معماری نرم‌افزار و توسعه', '👨‍💻', 3),
  ('بازی', 'gaming', 'بحث درباره بازی‌ها و دنیای گیم', '🎮', 4),
  ('فیلم و سریال', 'movies', 'فیلم‌ها، سریال‌ها و نقد و بررسی', '🎬', 5),
  ('کتاب', 'books', 'معرفی کتاب و گفت‌وگوی مطالعاتی', '📚', 6),
  ('موسیقی', 'music', 'موسیقی، آلبوم‌ها و تجربه شنیداری', '🎵', 7),
  ('خودرو', 'cars', 'خودرو، نگهداری و تجربه رانندگی', '🚗', 8),
  ('سلامت', 'health', 'سلامت جسم و ذهن، سبک زندگی', '🌱', 9),
  ('کسب‌وکار', 'business', 'کارآفرینی، بازار و کسب‌وکار', '💼', 10)
on conflict (slug) do nothing;

insert into public.tags (name, slug, is_official)
values
  ('سوال', 'question', true),
  ('بحث', 'discussion', true),
  ('آموزش', 'tutorial', true),
  ('خبر', 'news', true),
  ('کمک', 'help', true)
on conflict (slug) do nothing;

commit;
