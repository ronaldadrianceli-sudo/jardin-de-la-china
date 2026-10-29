# El Jardín de la China — MVP

Catálogo/e-commerce (WhatsApp) para vivero. Next.js 14 (App Router) + Supabase + Tailwind.

## Requisitos
- Node.js >= 20, npm
- Proyecto en Supabase y (opcional) Supabase CLI

## Instalación (proyecto nuevo)
```bash
npx create-next-app@14 jardin-de-la-china --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
cd jardin-de-la-china
npm i @supabase/ssr @supabase/supabase-js lucide-react react-hook-form zod@3 @hookform/resolvers
npm ls zod lucide-react @hookform/resolvers   # confirmar versiones
npm i -D @tailwindcss/forms
rm -f next.config.mjs        # usamos next.config.js
```
Copia los archivos del paquete encima (reemplazando los generados). El logo se sube después desde /admin/configuracion.

## Variables de entorno
```bash
cp .env.local.example .env.local   # y completa los valores
```

## Base de datos
Opción A — SQL Editor del dashboard: pega y ejecuta, en este orden, `supabase/migrations/001_init.sql`, `002_offers_and_multi_images.sql` y `003_settings_and_rich_text.sql`.

Opción B — CLI:
```bash
supabase login
supabase link --project-ref itcsjoetxixmjotudvod
supabase db push
```

## Admin
Authentication → Providers → Email: **desactiva "Allow new users to sign up"**.
Authentication → Users → *Add user* (email + contraseña, marca "Auto Confirm").

## Correr
```bash
npm run dev
```
http://localhost:3000 (catálogo) · http://localhost:3000/login (admin)

## Seed (sólo desarrollo)
SQL Editor: pega `supabase/seed.sql`, o con psql:
```bash
psql "$DATABASE_URL" < supabase/seed.sql
```
Revertir: ejecuta el bloque `-- REVERTIR` al final de `seed.sql`.
⚠️ Elimina esas filas antes de producción.

## Probar rendimiento real
`npm run dev` es lento a propósito (compila al vuelo). Para medir: `npm run build && npm start`.
