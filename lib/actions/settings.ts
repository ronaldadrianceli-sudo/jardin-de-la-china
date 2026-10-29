// lib/actions/settings.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getAuthed } from '@/lib/auth'
import { BUCKET, LOGO_PREFIX } from '@/lib/constants'
import { storagePathFromUrl } from '@/lib/utils'
import type { ActionResult } from '@/lib/types'

// El archivo se sube directo desde el navegador a plantas/logo/...; aquí sólo llega la URL.

const NO_SESSION: ActionResult = { ok: false, error: 'Tu sesión expiró. Inicia sesión de nuevo.' }

function revalidateSite() {
  revalidateTag('site-settings')
  revalidatePath('/', 'layout') // Header y Footer están en todas las páginas públicas
}

function isOwnLogoUrl(url: string): boolean {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')
  return base !== '' && url.startsWith(`${base}/storage/v1/object/public/${BUCKET}/${LOGO_PREFIX}`)
}

function logoPath(url: string | null): string | null {
  const path = storagePathFromUrl(url)
  return path !== null && path.startsWith(LOGO_PREFIX) ? path : null
}

export async function updateLogo(url: string): Promise<ActionResult> {
  const auth = await getAuthed()
  if (!auth) return NO_SESSION
  const { supabase } = auth

  if (typeof url !== 'string' || !isOwnLogoUrl(url)) return { ok: false, error: 'La imagen del logo no es válida.' }

  const { data: current } = await supabase.from('site_settings').select('logo_url').eq('id', 1).maybeSingle()
  const oldPath = logoPath((current as { logo_url: string | null } | null)?.logo_url ?? null)

  const { error } = await supabase.from('site_settings').upsert({ id: 1, logo_url: url }, { onConflict: 'id' })
  if (error) {
    const newPath = logoPath(url)
    if (newPath) await supabase.storage.from(BUCKET).remove([newPath]) // best-effort
    return { ok: false, error: 'No se pudo guardar el logo.' }
  }

  if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]) // best-effort

  revalidateSite()
  return { ok: true }
}

export async function removeLogo(): Promise<ActionResult> {
  const auth = await getAuthed()
  if (!auth) return NO_SESSION
  const { supabase } = auth

  const { data: current } = await supabase.from('site_settings').select('logo_url').eq('id', 1).maybeSingle()
  const oldPath = logoPath((current as { logo_url: string | null } | null)?.logo_url ?? null)

  const { error } = await supabase.from('site_settings').upsert({ id: 1, logo_url: null }, { onConflict: 'id' })
  if (error) return { ok: false, error: 'No se pudo quitar el logo.' }

  if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]) // best-effort

  revalidateSite()
  return { ok: true }
}
