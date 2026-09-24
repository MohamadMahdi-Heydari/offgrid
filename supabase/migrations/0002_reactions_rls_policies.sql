-- OffGrid — fix topic/reply reactions
-- The reactions table previously only had an INSERT policy, so authenticated
-- users could never read, update or delete their own reactions. The toggle
-- logic in the app (select existing -> insert/delete/update) therefore always
-- saw "no reaction" and retried INSERT, which failed with 23505 (duplicate
-- key) on the unique (user_id, target_type, target_id) constraint.

-- 1) Users can read their own reactions (needed for toggle state + highlight)
create policy "users read own reactions" on public.reactions
for select to authenticated
using (auth.uid() = user_id);

-- 2) Users can switch their reaction value (like <-> dislike)
create policy "users update own reactions" on public.reactions
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 3) Users can remove their reaction (toggle off)
create policy "users delete own reactions" on public.reactions
for delete to authenticated
using (auth.uid() = user_id);

-- Note: like_count / dislike_count on topics and replies are maintained by the
-- reactions_like_count_trigger, so the app reads denormalized counters from
-- the topics/replies rows (publicly selectable) instead of counting reaction
-- rows directly.
