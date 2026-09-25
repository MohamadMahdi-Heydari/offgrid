-- اجرای دستی در Supabase SQL Editor (Dashboard → SQL Editor → New query → Run)
-- خواندن عمومی جدول follows برای آمار و لیست دنبال‌کنندگان

drop policy if exists "public read follows" on public.follows;

create policy "public read follows"
on public.follows for select
to public
using (true);
