-- فعالسازی RLS
alter table public.topics enable row level security;
alter table public.replies enable row level security;
alter table public.reactions enable row level security;
alter table public.topic_tags enable row level security;

-- حذف policy قبلی برای اجرای idempotent
drop policy if exists "public can read topics" on public.topics;
drop policy if exists "verified users create topics" on public.topics;
drop policy if exists "topic author or moderator can update topic" on public.topics;
drop policy if exists "public read replies" on public.replies;
drop policy if exists "verified users reply" on public.replies;
drop policy if exists "reply author can update own reply" on public.replies;
drop policy if exists "verified users react" on public.reactions;
drop policy if exists "users delete own reactions" on public.reactions;
drop policy if exists "users update own reactions" on public.reactions;
drop policy if exists "authenticated add topic tags" on public.topic_tags;
drop policy if exists "public read topic tags" on public.topic_tags;

-- topics
create policy "public can read topics"
on public.topics
for select
to public
using (not is_deleted);

create policy "verified users create topics"
on public.topics
for insert
to authenticated
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  )
);

create policy "topic author or moderator can update topic"
on public.topics
for update
to authenticated
using (
  auth.uid() = author_id
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('moderator','admin','legend')
  )
)
with check (
  auth.uid() = author_id
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('moderator','admin','legend')
  )
);

-- replies
create policy "public read replies"
on public.replies
for select
to public
using (not is_deleted);

create policy "verified users reply"
on public.replies
for insert
to authenticated
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  )
);

create policy "reply author can update own reply"
on public.replies
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

-- reactions
create policy "verified users react"
on public.reactions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  )
);

create policy "users delete own reactions"
on public.reactions
for delete
to authenticated
using (auth.uid() = user_id);

create policy "users update own reactions"
on public.reactions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "public read reactions"
on public.reactions
for select
to public
using (true);

-- topic_tags
create policy "public read topic tags"
on public.topic_tags
for select
to public
using (true);

create policy "authenticated add topic tags"
on public.topic_tags
for insert
to authenticated
with check (true);
