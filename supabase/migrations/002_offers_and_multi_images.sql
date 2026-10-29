-- supabase/migrations/002_offers_and_multi_images.sql
-- Ejecutar DESPUÉS de 001_init.sql y ANTES de desplegar el código nuevo.

-- ========== 1. OFERTAS ==========
alter table public.plants
  add column if not exists precio_oferta numeric(10,2);

alter table public.plants drop constraint if exists plants_precio_oferta_check;
alter table public.plants
  add constraint plants_precio_oferta_check
  check (precio_oferta is null or (precio_oferta > 0 and precio_oferta < price));

-- ========== 2. MÚLTIPLES IMÁGENES (text[]) ==========
alter table public.plants
  add column if not exists image_urls text[] not null default '{}';

-- Copiar la foto única existente al arreglo y eliminar la columna vieja.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'plants' and column_name = 'image_url'
  ) then
    update public.plants
       set image_urls = array[image_url]
     where image_url is not null
       and coalesce(cardinality(image_urls), 0) = 0;

    alter table public.plants drop column image_url;
  end if;
end $$;

alter table public.plants drop constraint if exists plants_image_urls_max_check;
alter table public.plants
  add constraint plants_image_urls_max_check
  check (cardinality(image_urls) <= 8);

-- Las políticas RLS y de Storage de 001_init.sql NO cambian.
