-- سیستم نوتیفیکیشن آفگرید
-- جدول notifications از قبل وجود دارد (0001); این فایل آن را کامل می‌کند:
-- ایندکس‌ها + سیاست‌های RLS کامل + تریگرهای خودکار ساخت نوتیف.

-- ─── ایندکس‌ها ───
create index if not exists idx_notifications_user_created
  on public.notifications (user_id, created_at desc);

create index if not exists idx_notifications_user_unread
  on public.notifications (user_id) where is_read = false;

-- ─── سیاست‌های RLS (خواندن از قبل هست ولی idempotent می‌نویسیم) ───
alter table public.notifications enable row level security;

drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications"
on public.notifications for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications"
on public.notifications for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users delete own notifications" on public.notifications;
create policy "users delete own notifications"
on public.notifications for delete
to authenticated
using (auth.uid() = user_id);

-- درج نوتیف فقط توسط تریگرها (SECURITY DEFINER) انجام می‌شود؛ هیچ policy
-- مستقیم برای insert نمی‌دهیم تا کاربر نتواند برای دیگران نوتیف جعلی بسازد.

-- ─── تریگر ۱: پاسخ جدید ───
create or replace function public.notify_on_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  topic_author uuid;
  parent_author uuid;
begin
  if NEW.is_deleted = true then
    return NEW;
  end if;

  select author_id into topic_author
  from topics where id = NEW.topic_id;

  -- پاسخ مستقیم به تاپیک → نوتیف نویسنده‌ی تاپیک
  if NEW.parent_id is null
     and topic_author is not null
     and topic_author <> NEW.author_id then
    insert into notifications (user_id, kind, payload)
    values (
      topic_author,
      'topic_reply',
      jsonb_build_object(
        'topic_id', NEW.topic_id,
        'reply_id', NEW.id,
        'actor_id', NEW.author_id
      )
    );
  end if;

  -- پاسخ به پاسخ → نوتیف نویسنده‌ی والد
  if NEW.parent_id is not null then
    select author_id into parent_author
    from replies where id = NEW.parent_id;

    if parent_author is not null
       and parent_author <> NEW.author_id
       and parent_author <> topic_author then
      insert into notifications (user_id, kind, payload)
      values (
        parent_author,
        'reply_reply',
        jsonb_build_object(
          'topic_id', NEW.topic_id,
          'reply_id', NEW.id,
          'parent_reply_id', NEW.parent_id,
          'actor_id', NEW.author_id
        )
      );
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists on_reply_notify on public.replies;
create trigger on_reply_notify
after insert on public.replies
for each row execute function public.notify_on_reply();

-- ─── تریگر ۲: فالو جدید ───
create or replace function public.notify_on_follow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into notifications (user_id, kind, payload)
  values (
    NEW.following_id,
    'new_follower',
    jsonb_build_object('actor_id', NEW.follower_id)
  );
  return NEW;
end;
$$;

drop trigger if exists on_follow_notify on public.follows;
create trigger on_follow_notify
after insert on public.follows
for each row execute function public.notify_on_follow();

-- ─── تریگر ۳: لایک (فانوس روشن) ───
create or replace function public.notify_on_reaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_author uuid;
  kind_value text;
begin
  -- فقط لایک مثبتِ تازه (پاس‌بخش UPDATE/DELETE toggle)
  if NEW.value <> 1 then
    return NEW;
  end if;

  if NEW.target_type = 'topic' then
    select author_id into target_author
    from topics where id = NEW.target_id;
    kind_value := 'topic_like';
  elsif NEW.target_type = 'reply' then
    select author_id into target_author
    from replies where id = NEW.target_id;
    kind_value := 'reply_like';
  end if;

  if target_author is not null
     and target_author <> NEW.user_id then
    insert into notifications (user_id, kind, payload)
    values (
      target_author,
      kind_value,
      jsonb_build_object(
        'target_type', NEW.target_type,
        'target_id', NEW.target_id,
        'actor_id', NEW.user_id
      )
    );
  end if;

  return NEW;
end;
$$;

drop trigger if exists on_reaction_notify on public.reactions;
create trigger on_reaction_notify
after insert on public.reactions
for each row execute function public.notify_on_reaction();
