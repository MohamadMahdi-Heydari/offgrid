-- آمار و لیست دنبال‌کنندگان/دنبال‌شده‌ها به‌صورت عمومی قابل مشاهده است
-- (مثل Reddit). تا پیش از این فقط خودِ follower می‌توانست ردیف خودش را ببیند.

drop policy if exists "public read follows" on public.follows;

create policy "public read follows"
on public.follows for select
to public
using (true);

-- توجه: سیاست «users manage own follows» (0001) برای insert/update/delete
-- همچنان فعال و محدود به خود کاربر است؛ این سیاست فقط خواندن را باز می‌کند.
