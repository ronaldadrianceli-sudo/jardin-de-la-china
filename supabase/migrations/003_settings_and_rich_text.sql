-- supabase/migrations/003_settings_and_rich_text.sql
-- Ejecutar DESPUÉS de 001 y 002.

-- ========== 1. site_settings (una sola fila, id = 1) ==========
create table if not exists public.site_settings (
  id         int primary key default 1 check (id = 1),
  logo_url   text,
  updated_at timestamptz default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- Reutiliza public.set_updated_at() creada en 001_init.sql
drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select_all"  on public.site_settings;
drop policy if exists "site_settings_insert_auth" on public.site_settings;
drop policy if exists "site_settings_update_auth" on public.site_settings;

create policy "site_settings_select_all"  on public.site_settings
  for select to anon, authenticated using (true);
create policy "site_settings_insert_auth" on public.site_settings
  for insert to authenticated with check (id = 1);
create policy "site_settings_update_auth" on public.site_settings
  for update to authenticated using (id = 1) with check (id = 1);
-- Sin política DELETE: la fila de configuración no se puede borrar.

-- El logo se guarda en el bucket `plantas` bajo el prefijo logo/ (las políticas de Storage de 001 ya lo cubren).

-- ========== 2. Descripción con HTML ==========
-- description ya era text; esto es idempotente y deja explícito que admite HTML.
alter table public.plants alter column description type text;

-- ========== 3. Índices acordes a las consultas reales ==========
-- Consultas: ORDER BY created_at DESC [WHERE category = ?]. Nada filtra por `available`.
create index if not exists plants_created_at_idx        on public.plants (created_at desc);
create index if not exists plants_category_created_idx  on public.plants (category, created_at desc);
drop index if exists public.plants_available_idx;  -- booleano de baja selectividad, sin uso
drop index if exists public.plants_category_idx;   -- cubierto por plants_category_created_idx
