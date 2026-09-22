-- OffGrid forum policies v2
-- هدف: حذف وابستگی policyها به auth.users

-- RLS
alter table public.topics enable row level security;
alter table public.replies enable row level security;
alter table public.reactions enable row level security;
alter table public.topic_tags enable row level security;
alter table public.follows enable row level security;
alter table public.bookmarks enable row level security;
alter table public.topic_follows enable row level security;

-- drop old policies (idempotent)
drop policy if exists "public can read topics" on public.topics;
drop policy if exists "verified users create topics" on public.topics;
drop policy if exists "authenticated users create topics" on public.topics;
drop policy if exists "topic author or moderator can update topic" on public.topics;

drop policy if exists "public read replies" on public.replies;
drop policy if exists "verified users reply" on public.replies;
drop policy if exists "authenticated users reply" on public.replies;
drop policy if exists "reply author can update own reply" on public.replies;

drop policy if exists "verified users react" on public.reactions;
drop policy if exists "authenticated users react" on public.reactions;
drop policy if exists "users delete own reactions" on public.reactions;
drop policy if exists "users delete own reaction" on public.reactions;
drop policy if exists "users update own reactions" on public.reactions;
drop policy if exists "public read reactions" on public.reactions;

drop policy if exists "authenticated add topic tags" on public.topic_tags;
drop policy if exists "authenticated create topic_tags" on public.topic_tags;
drop policy if exists "public read topic tags" on public.topic_tags;

drop policy if exists "users manage own follows" on public.follows;
drop policy if exists "users manage own bookmarks" on public.bookmarks;
drop policy if exists "users manage own topic follows" on public.topic_follows;

-- topics
create policy "public can read topics"
on public.topics
for select
to public
using (not is_deleted);

create policy "authenticated users create topics"
on public.topics
for insert
to authenticated
with check (auth.uid() = author_id);

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

create policy "authenticated users reply"
on public.replies
for insert
to authenticated
with check (auth.uid() = author_id);

create policy "reply author can update own reply"
on public.replies
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

-- reactions
create policy "public read reactions"
on public.reactions
for select
to public
using (true);

create policy "authenticated users react"
on public.reactions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users update own reactions"
on public.reactions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users delete own reaction"
on public.reactions
for delete
to authenticated
using (auth.uid() = user_id);

-- topic_tags
create policy "public read topic tags"
on public.topic_tags
for select
to public
using (true);

create policy "authenticated create topic_tags"
on public.topic_tags
for insert
to authenticated
with check (
  exists (
    select 1
    from public.topics t
    where t.id = topic_id and t.author_id = auth.uid()
  )
);

-- follows
create policy "users manage own follows"
on public.follows
for all
to authenticated
using (auth.uid() = follower_id)
with check (auth.uid() = follower_id);

-- bookmarks
create policy "users manage own bookmarks"
on public.bookmarks
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- topic_follows
create policy "users manage own topic follows"
on public.topic_follows
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
