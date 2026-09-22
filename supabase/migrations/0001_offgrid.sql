create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-zA-Z0-9_.-]+$'),
  display_name text,
  bio text,
  avatar_url text,
  city text,
  job text,
  role text not null default 'user' check (role in ('user','moderator','admin','legend')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  "order" int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  body text not null,
  type text not null check (type in ('discussion','question')),
  question_context text,
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  is_solved boolean not null default false,
  best_reply_id uuid,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  like_count int not null default 0,
  dislike_count int not null default 0,
  reply_count int not null default 0,
  created_at timestamptz not null default now(),
  last_activity timestamptz not null default now()
);

create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  parent_id uuid references public.replies(id) on delete set null,
  body text not null,
  path text not null,
  depth int not null default 0,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  like_count int not null default 0,
  dislike_count int not null default 0,
  reply_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.topics add constraint topics_best_reply_fk foreign key (best_reply_id) references public.replies(id) on delete set null;

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('topic','reply')),
  target_id uuid not null,
  value smallint not null check (value in (1,-1)),
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

create table if not exists public.topic_follows (
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create table if not exists public.bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  is_official boolean not null default false,
  usage_count int not null default 0
);

create table if not exists public.topic_tags (
  topic_id uuid not null references public.topics(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (topic_id, tag_id)
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('topic','reply')),
  target_id uuid not null,
  kind text not null check (kind in ('image','video_embed')),
  url text not null,
  thumbnail_url text,
  "order" int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null unique references public.topics(id) on delete cascade,
  question text not null,
  is_multiple boolean not null default false,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  text text not null,
  "order" int not null default 0
);

create table if not exists public.poll_votes (
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (poll_id, option_id, user_id)
);

create table if not exists public.mentions (
  id uuid primary key default gen_random_uuid(),
  mentioned_user_id uuid not null references public.profiles(id) on delete cascade,
  source_type text not null check (source_type in ('topic','reply')),
  source_id uuid not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('topic','reply','user')),
  target_id uuid not null,
  reason text not null,
  description text,
  status text not null default 'pending' check (status in ('pending','reviewed','dismissed','actioned')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

create table if not exists public.warnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  issued_by uuid not null references public.profiles(id) on delete set null,
  reason text not null,
  message text not null,
  is_acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  payload jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substring(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', 'کاربر جدید')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.update_like_count()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'DELETE') then
    if old.target_type = 'topic' then
      update public.topics
      set like_count = (select count(*) from public.reactions where target_type = 'topic' and target_id = old.target_id and value = 1),
          dislike_count = (select count(*) from public.reactions where target_type = 'topic' and target_id = old.target_id and value = -1)
      where id = old.target_id;
    else
      update public.replies
      set like_count = (select count(*) from public.reactions where target_type = 'reply' and target_id = old.target_id and value = 1),
          dislike_count = (select count(*) from public.reactions where target_type = 'reply' and target_id = old.target_id and value = -1)
      where id = old.target_id;
    end if;
    return old;
  end if;

  if new.target_type = 'topic' then
    update public.topics
    set like_count = (select count(*) from public.reactions where target_type = 'topic' and target_id = new.target_id and value = 1),
        dislike_count = (select count(*) from public.reactions where target_type = 'topic' and target_id = new.target_id and value = -1)
    where id = new.target_id;
  else
    update public.replies
    set like_count = (select count(*) from public.reactions where target_type = 'reply' and target_id = new.target_id and value = 1),
        dislike_count = (select count(*) from public.reactions where target_type = 'reply' and target_id = new.target_id and value = -1)
    where id = new.target_id;
  end if;

  return new;
end;
$$;

create trigger reactions_like_count_trigger
after insert or update or delete on public.reactions
for each row execute function public.update_like_count();

create or replace function public.update_reply_count()
returns trigger
language plpgsql
as $$
begin
  update public.topics set reply_count = reply_count + 1 where id = new.topic_id;
  if new.parent_id is not null then
    update public.replies set reply_count = reply_count + 1 where id = new.parent_id;
  end if;
  return new;
end;
$$;

create trigger replies_count_trigger
after insert on public.replies
for each row execute function public.update_reply_count();

create or replace function public.update_last_activity()
returns trigger
language plpgsql
as $$
begin
  update public.topics set last_activity = now() where id = new.topic_id;
  return new;
end;
$$;

create trigger replies_last_activity_trigger
after insert on public.replies
for each row execute function public.update_last_activity();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.topics enable row level security;
alter table public.replies enable row level security;
alter table public.reactions enable row level security;
alter table public.follows enable row level security;
alter table public.topic_follows enable row level security;
alter table public.bookmarks enable row level security;
alter table public.tags enable row level security;
alter table public.topic_tags enable row level security;
alter table public.media enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.mentions enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.warnings enable row level security;
alter table public.notifications enable row level security;

create policy "public can read topics" on public.topics
for select using (not is_deleted);

create policy "authenticated users create topics" on public.topics
for insert to authenticated
with check (auth.uid() = author_id);

create policy "authenticated users reply" on public.replies
for insert to authenticated
with check (auth.uid() = author_id);

create policy "authenticated users react" on public.reactions
for insert to authenticated
with check (auth.uid() = user_id);

create policy "public read categories" on public.categories for select using (true);
create policy "public read tags" on public.tags for select using (true);
create policy "public read replies" on public.replies for select using (not is_deleted);
create policy "users read own profile" on public.profiles for select using (true);

create policy "users manage own follows" on public.follows for all to authenticated using (auth.uid() = follower_id) with check (auth.uid() = follower_id);
create policy "users manage own topic follows" on public.topic_follows for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own bookmarks" on public.bookmarks for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own blocks" on public.blocks for all to authenticated using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);
create policy "users create reports" on public.reports for insert to authenticated with check (auth.uid() = reporter_id);
create policy "users read own warnings" on public.warnings for select to authenticated using (auth.uid() = user_id);
create policy "users ack own warnings" on public.warnings for update to authenticated using (auth.uid() = user_id);
create policy "users read own notifications" on public.notifications for select to authenticated using (auth.uid() = user_id);
