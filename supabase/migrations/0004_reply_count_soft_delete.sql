-- شمارش پاسخ باید پاسخ‌های حذف‌شده (is_deleted = true) را هم لحاظ نکند.
-- تریگر قبلی فقط روی INSERT یکی به reply_count اضافه می‌کرد، پس حذف نرم
-- پاسخ هرگز عدد را کم نمی‌کرد و شمارنده از واقعیت جلوتر می‌ماند.

create or replace function public.update_reply_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'insert' then
    -- فقط فعال‌ها شمرده می‌شوند (از اول همین‌طور بود)
    if not new.is_deleted then
      update public.topics set reply_count = reply_count + 1 where id = new.topic_id;
      if new.parent_id is not null then
        update public.replies set reply_count = reply_count + 1 where id = new.parent_id;
      end if;
    end if;
    return new;
  end if;

  if tg_op = 'update' then
    -- حذف نرم شدن: -۱
    if not old.is_deleted and new.is_deleted then
      update public.topics set reply_count = reply_count - 1 where id = new.topic_id;
      if new.parent_id is not null then
        update public.replies set reply_count = reply_count - 1 where id = new.parent_id;
      end if;
    -- بازیابی: +۱
    elsif old.is_deleted and not new.is_deleted then
      update public.topics set reply_count = reply_count + 1 where id = new.topic_id;
      if new.parent_id is not null then
        update public.replies set reply_count = reply_count + 1 where id = new.parent_id;
      end if;
    end if;
    return new;
  end if;

  -- حذف فیزیکی (تهی‌سازی زباله‌دان): -۱ اگر هنوز فعال بوده
  if tg_op = 'delete' then
    if not old.is_deleted then
      update public.topics set reply_count = reply_count - 1 where id = old.topic_id;
      if old.parent_id is not null then
        update public.replies set reply_count = reply_count - 1 where id = old.parent_id;
      end if;
    end if;
    return old;
  end if;

  return new;
end $$;

-- تریگر جدید که هم INSERT را هم UPDATE (is_deleted flip) را هم DELETE را پوشش می‌دهد
drop trigger if exists replies_count_trigger on public.replies;

create trigger replies_count_trigger
after insert or update of is_deleted or delete on public.replies
for each row execute function public.update_reply_count();

-- بازنویسی شمارنده‌ها بر اساس داده‌ی صحیح فعلی (بدون حذف‌شده‌ها)
update public.topics t
set reply_count = (
  select count(*)
  from public.replies r
  where r.topic_id = t.id and r.is_deleted = false
);

update public.replies p
set reply_count = (
  select count(*)
  from public.replies c
  where c.parent_id = p.id and c.is_deleted = false
);
