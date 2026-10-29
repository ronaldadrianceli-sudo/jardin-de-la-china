-- supabase/migrations/001_init.sql

-- ========== TABLA ==========
create table if not exists public.plants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  category    text not null check (category in ('palmas', 'interior', 'otras')),
  price       numeric(10,2) not null check (price >= 0),
  available   boolean default true,
  image_url   text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists plants_category_idx  on public.plants (category);
create index if not exists plants_available_idx on public.plants (available);

-- ========== TRIGGER updated_at ==========
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists plants_set_updated_at on public.plants;
create trigger plants_set_updated_at
  before update on public.plants
  for each row execute function public.set_updated_at();

-- ========== RLS (tabla) ==========
alter table public.plants enable row level security;

drop policy if exists "plants_select_all"   on public.plants;
drop policy if exists "plants_insert_auth"  on public.plants;
drop policy if exists "plants_update_auth"  on public.plants;
drop policy if exists "plants_delete_auth"  on public.plants;

create policy "plants_select_all"  on public.plants
  for select to anon, authenticated using (true);

create policy "plants_insert_auth" on public.plants
  for insert to authenticated with check (true);

create policy "plants_update_auth" on public.plants
  for update to authenticated using (true) with check (true);

create policy "plants_delete_auth" on public.plants
  for delete to authenticated using (true);

-- ========== STORAGE: bucket + políticas ==========
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('plantas', 'plantas', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "plantas_public_read"  on storage.objects;
drop policy if exists "plantas_auth_insert"  on storage.objects;
drop policy if exists "plantas_auth_update"  on storage.objects;
drop policy if exists "plantas_auth_delete"  on storage.objects;

create policy "plantas_public_read" on storage.objects
  for select to public using (bucket_id = 'plantas');

create policy "plantas_auth_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'plantas');

create policy "plantas_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'plantas') with check (bucket_id = 'plantas');

create policy "plantas_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'plantas');
