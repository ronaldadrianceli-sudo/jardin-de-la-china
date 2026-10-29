-- supabase/seed.sql
-- ⚠️ SOLO DESARROLLO. Eliminar estas filas antes de producción. La app NO depende de este archivo.
-- Requiere haber ejecutado 001 y 002. Placeholders .png (next/image bloquea SVG por defecto).

insert into public.plants (id, name, description, category, price, precio_oferta, available, image_urls) values
  ('11111111-1111-4111-8111-111111111111', 'Palma Areca',
   'Palma elegante de hojas arqueadas, ideal para salas luminosas. Purifica el aire.',
   'palmas', 25.00, null, true,
   array['https://placehold.co/600x750/6B7F4E/F5F1E8.png?text=Palma+Areca',
         'https://placehold.co/600x750/A3B18A/2C3E2D.png?text=Areca+2']),
  ('22222222-2222-4222-8222-222222222222', 'Monstera Deliciosa',
   'Hojas grandes y perforadas, muy decorativa. Requiere luz indirecta y riego moderado.',
   'interior', 18.50, 14.99, true,
   array['https://placehold.co/600x750/6B7F4E/F5F1E8.png?text=Monstera']),
  ('33333333-3333-4333-8333-333333333333', 'Suculenta Echeveria',
   'Roseta compacta de bajo mantenimiento, perfecta para escritorios y repisas.',
   'otras', 6.00, null, true,
   array['https://placehold.co/600x750/6B7F4E/F5F1E8.png?text=Echeveria']),
  ('44444444-4444-4444-8444-444444444444', 'Palma Kentia',
   'Palma de porte elegante y crecimiento lento. Temporalmente sin stock.',
   'palmas', 40.00, null, false,
   array['https://placehold.co/600x750/6B7F4E/F5F1E8.png?text=Palma+Kentia'])
on conflict (id) do nothing;

-- REVERTIR:
-- delete from public.plants where id in (
--   '11111111-1111-4111-8111-111111111111',
--   '22222222-2222-4222-8222-222222222222',
--   '33333333-3333-4333-8333-333333333333',
--   '44444444-4444-4444-8444-444444444444');
