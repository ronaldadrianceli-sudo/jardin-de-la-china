// lib/data.ts  — lecturas públicas cacheadas (Data Cache de Next).
// Se invalidan con revalidateTag('plants' | 'site-settings') desde los Server Actions.
import { unstable_cache } from 'next/cache'
import { REVALIDATE_SECONDS } from '@/lib/constants'
import { createPublicClient } from '@/lib/supabase/public'
import type { Category, Plant, SiteSettings } from '@/lib/types'

export function getPlants(category?: Category): Promise<Plant[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient()
      let query = supabase.from('plants').select('*').order('created_at', { ascending: false })
      if (category) query = query.eq('category', category)
      const { data, error } = await query
      if (error) throw new Error('No se pudo cargar el catálogo')
      return (data ?? []) as Plant[] // cast justificado: sin tipos generados
    },
    ['plants-list', category ?? 'all'],
    { revalidate: REVALIDATE_SECONDS, tags: ['plants'] }
  )()
}

export function getPlant(id: string): Promise<Plant | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient()
      const { data, error } = await supabase.from('plants').select('*').eq('id', id).maybeSingle()
      if (error) throw new Error('No se pudo cargar la planta')
      return (data as Plant | null) ?? null
    },
    ['plant', id],
    { revalidate: REVALIDATE_SECONDS, tags: ['plants'] }
  )()
}

const EMPTY_SETTINGS: SiteSettings = { logo_url: null }

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    return await unstable_cache(
      async () => {
        const supabase = createPublicClient()
        const { data, error } = await supabase.from('site_settings').select('logo_url').eq('id', 1).maybeSingle()
        if (error) throw new Error('No se pudo cargar la configuración')
        return { logo_url: (data as { logo_url: string | null } | null)?.logo_url ?? null }
      },
      ['site-settings'],
      { revalidate: REVALIDATE_SECONDS, tags: ['site-settings'] }
    )()
  } catch {
    // Si la tabla aún no existe o falla la red, el sitio sigue funcionando sin logo.
    return EMPTY_SETTINGS
  }
}
