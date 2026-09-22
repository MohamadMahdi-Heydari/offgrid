-- Like/Dislike counters sync trigger
-- این اسکریپت idempotent است و اجرای چندباره مشکلی ایجاد نمی‌کند.

create or replace function public.update_like_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.target_type = 'topic' then
      update public.topics
      set
        like_count = like_count + case when new.value = 1 then 1 else 0 end,
        dislike_count = dislike_count + case when new.value = -1 then 1 else 0 end
      where id = new.target_id;
    elsif new.target_type = 'reply' then
      update public.replies
      set
        like_count = like_count + case when new.value = 1 then 1 else 0 end,
        dislike_count = dislike_count + case when new.value = -1 then 1 else 0 end
      where id = new.target_id;
    end if;

    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.target_type = 'topic' then
      update public.topics
      set
        like_count = greatest(0, like_count - case when old.value = 1 then 1 else 0 end),
        dislike_count = greatest(0, dislike_count - case when old.value = -1 then 1 else 0 end)
      where id = old.target_id;
    elsif old.target_type = 'reply' then
      update public.replies
      set
        like_count = greatest(0, like_count - case when old.value = 1 then 1 else 0 end),
        dislike_count = greatest(0, dislike_count - case when old.value = -1 then 1 else 0 end)
      where id = old.target_id;
    end if;

    return old;
  end if;

  if tg_op = 'UPDATE' then
    if old.value <> new.value then
      if new.target_type = 'topic' then
        update public.topics
        set
          like_count = greatest(0, like_count + case when new.value = 1 then 1 else -1 end),
          dislike_count = greatest(0, dislike_count + case when new.value = -1 then 1 else -1 end)
        where id = new.target_id;
      elsif new.target_type = 'reply' then
        update public.replies
        set
          like_count = greatest(0, like_count + case when new.value = 1 then 1 else -1 end),
          dislike_count = greatest(0, dislike_count + case when new.value = -1 then 1 else -1 end)
        where id = new.target_id;
      end if;
    end if;

    return new;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists on_reaction_change on public.reactions;
create trigger on_reaction_change
after insert or update or delete on public.reactions
for each row execute function public.update_like_count();
