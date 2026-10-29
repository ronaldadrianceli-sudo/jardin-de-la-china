// lib/supabase/public.ts
// Cliente de SOLO LECTURA anónima, sin cookies. No llama a cookies(), así que las páginas
// públicas pueden cachearse (ISR). Úsalo únicamente para datos públicos (RLS: anon puede SELECT).
import { createServerClient } from '@supabase/ssr'

export function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // sin sesión: nada que guardar
        },
      },
    }
  )
}
