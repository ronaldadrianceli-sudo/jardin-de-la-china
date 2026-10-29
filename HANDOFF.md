# HANDOFF.md

## 0. Cómo correr localmente
1. Node >= 20. `npm install` (ya incluye Tiptap y sanitize-html).
2. `.env.local` (copiar de `.env.local.example`): URL Supabase, anon key, WhatsApp 593989276809, USD, es-EC.
3. Supabase SQL Editor, EN ORDEN: `001_init.sql`, `002_offers_and_multi_images.sql`, `003_settings_and_rich_text.sql`.
4. Auth → Email: DESACTIVAR sign-ups; crear usuario admin (Auto Confirm).
5. `npm run dev` → / (catálogo), /login, /admin, /admin/configuracion.
6. Medir rendimiento con `npm run build && npm start` (dev es lento por diseño).
Migraciones pendientes: 001, 002, 003 (no confirmado que estén ejecutadas).

## 1. Metadata
- Última actualización: 2026-10-28 (v0.3: logo dinámico, editor enriquecido, rendimiento)
- Stack: Next 14.2, React 18, TS estricto, Tailwind 3, @supabase/ssr 0.5, RHF + zod 3, lucide 0.453, @tiptap/{react,pm,starter-kit,extension-text-align} ^2.27, sanitize-html ^2.18
- Estado global: EN PROGRESO. `tsc`, `next lint` y `next build` (con fuentes simuladas, el sandbox no llega a Google Fonts) pasan. Sanitización XSS probada con 8 casos. NADA probado contra Supabase real ni en navegador.

## 2. Resumen
Catálogo del vivero "El Jardín de la China": clientes ven plantas (ofertas, galería, detalle) y compran por WhatsApp; la dueña administra plantas, fotos y logo desde /admin.

## 3. Decisiones tomadas
- Server Actions para CRUD; autorización con getUser(). Subidas de imágenes directo del navegador a Storage (límite ~4.5 MB de Vercel); los Server Actions sólo reciben URLs.
- USD / es-EC; WhatsApp 593989276809; API https://itcsjoetxixmjotudvod.supabase.co.
- zod@3 fijado; Instagram = SVG propio (Lucide 1.x sin marcas); PlantCard/WhatsAppButton = Server Components sin eventos.
- v0.2: `precio_oferta` (CHECK < price), `image_urls text[]` (máx 8), lightbox Tailwind, detalle /plantas/[id].
- v0.3 LOGO: tabla `site_settings` (fila única id=1, sin DELETE). Logo en bucket `plantas` bajo `logo/`, subido desde el navegador (máx 1 MB, JPG/PNG/WebP, recomendado 512×512). `SiteLogo` es la ÚNICA fuente: Header, Footer y Login leen `getSiteSettings()`. Sin logo → icono Sprout. Al guardar: revalidateTag('site-settings') + revalidatePath('/','layout'). Se ELIMINÓ public/logo.jpg y la constante LOGO_SRC; metadata/OG ahora es generateMetadata con el logo de la BD.
- v0.3 EDITOR: Tiptap v2 (react-quill usa findDOMNode, mal con React 18/Strict). Botones: negrita, cursiva, H2, H3, izq/centro/justificado, viñetas, numerada, deshacer/rehacer. `description` guarda HTML. Carga con next/dynamic ssr:false e `immediatelyRender:false`. Render público: sanitize-html (no isomorphic-dompurify: arrastra jsdom y da ERR_REQUIRE_ESM en serverless) con lista blanca p, br, strong, b, em, i, h2, h3, ul, ol, li y sólo style text-align. Descripciones antiguas en texto plano se convierten en `plainToHtml`. Tarjetas/metadata usan `htmlToText`. Máx 2000 caracteres de texto visible.
- v0.3 RENDIMIENTO: (1) `lib/supabase/public.ts` = cliente anónimo SIN cookies (createServerClient con getAll vacío) + `lib/data.ts` con unstable_cache (300 s, tags 'plants'/'site-settings'); antes `cookies()` volvía dinámicas TODAS las páginas y cada visita consultaba la BD. (2) /plantas/[id]: revalidate=300 + generateStaticParams()=[] → ISR (● en el build). (3) Home sigue dinámica por `?categoria=` (searchParams) pero sin consulta a la BD. (4) Fotos: compresión en el navegador (máx 1600 px, WebP) antes de subir, cacheControl 1 año, images.minimumCacheTTL 30 días, `priority` en las 2 primeras tarjetas y en el logo del header, Lightbox con next/dynamic. (5) Índices: created_at desc y (category, created_at desc); se eliminaron plants_available_idx y plants_category_idx. (6) Fuentes ya usaban next/font.

## 4. Estructura (✅ generado; ⏳ sin probar en ejecución)
app/{layout,page,loading,error}, app/login, app/plantas/[id], app/admin/{page,nueva,[id]/editar,configuracion} ✅
components/{PlantCard,PlantForm,RichTextEditor,RichText,SiteLogo,LogoForm,SiteHeader,SiteFooter,PriceBlock,WhatsAppButton,Lightbox,ZoomableImage,PlantGallery,CategoryFilter,AdminHeader,StatusToggle,DeleteButton,LoginForm,LogoutButton,Spinner} ✅
lib/{data,richtext,image-compress,actions/{plants,auth,settings},supabase/{server,client,public},auth,constants,types,utils,validation}, middleware.ts ✅
supabase/migrations/{001,002,003}, seed.sql ✅

## 5. Estado por módulo
| Módulo | Estado | Notas |
|---|---|---|
| SQL/DB | ⏳ | 001–003 escritos, no ejecutados |
| Auth | ⏳ | Sin probar |
| Catálogo / detalle | ⏳ | Build OK, sin probar con datos reales |
| Admin CRUD + multi-foto | ⏳ | Sin probar |
| Logo dinámico | ⏳ | Sin probar; requiere 003 |
| Editor enriquecido | ⏳ | Compila; falta probar en navegador (justificado, listas) |
| Rendimiento/caché | ⏳ | Verificar que un cambio en admin se refleje en el sitio |
| Seed | ⏳ | No ejecutado |

## 6. Variables de entorno (sólo nombres; sin validar)
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_WHATSAPP_NUMBER, NEXT_PUBLIC_CURRENCY, NEXT_PUBLIC_LOCALE, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_INSTAGRAM_URL (opcional)

## 7. Migraciones / SQL
001 (tabla, RLS, bucket plantas 5MB), 002 (precio_oferta, image_urls; DROP image_url), 003 (site_settings + RLS, description text, índices nuevos, DROP de 2 índices viejos). Ejecutar SIEMPRE antes de desplegar el código correspondiente.
⚠️ seed.sql sólo desarrollo; eliminar filas antes de producción.

## 8. Problemas conocidos / deuda técnica
- Nada probado en navegador ni contra Supabase real. Fuentes de Google necesitan internet al compilar.
- Cambios hechos directo en el dashboard de Supabase (no por /admin) tardan hasta 5 min en verse (caché).
- La compresión usa Canvas/WebP; navegadores sin soporte suben el original.
- Fotos huérfanas posibles si se corta la red entre subir y guardar (limpieza best-effort).
- Políticas de escritura = cualquier usuario autenticado → sign-ups DEBEN estar desactivados.
- Sin tests automáticos ni tipos generados de Supabase. Bundle de /admin/nueva ≈ 200 kB por Tiptap (sólo admin).
- Sin logo configurado se muestra icono Sprout (el logo.jpg original ya no se usa).

## 9. Próximo paso concreto
Ejecutar 003 en Supabase, subir un logo en /admin/configuracion y comprobar que cambia en Header, Footer y Login.
1. Crear/editar una planta con descripción formateada (justificado, H2, viñetas) y verla en /plantas/[id].
2. Editar una planta y confirmar que el catálogo se actualiza sin esperar 5 min.
3. Medir con `npm run build && npm start` (Lighthouse móvil); luego quitar seed y placehold.co y desplegar en Vercel.

## 10. Prompt para retomar
"Soy desarrollador retomando el proyecto descrito en HANDOFF.md (adjunto). Léelo completo antes de responder. Tu tarea es ejecutar el 'Próximo paso concreto' sin romper lo ya hecho. Pregunta si algo no está claro."
