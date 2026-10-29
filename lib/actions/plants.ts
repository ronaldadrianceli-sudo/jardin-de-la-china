// lib/actions/plants.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { getAuthed } from '@/lib/auth'
import { BUCKET } from '@/lib/constants'
import { plantPayloadSchema, type PlantPayload } from '@/lib/validation'
import { storagePathFromUrl } from '@/lib/utils'
import type { ActionResult } from '@/lib/types'

// Las imágenes se suben directo desde el navegador al bucket `plantas`
// (evita el límite de ~4.5 MB por request de Vercel). Aquí sólo llegan las URLs.

const NO_SESSION: ActionResult = { ok: false, error: 'Tu sesión expiró. Inicia sesión de nuevo.' }
const idSchema = z.string().uuid()

function revalidateAll() {
  revalidateTag('plants')
  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/plantas/[id]', 'page')
}

function isOwnImageUrl(url: string): boolean {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')
  return base !== '' && url.startsWith(`${base}/storage/v1/object/public/${BUCKET}/`)
}

function pathsFromUrls(urls: string[]): string[] {
  return urls.map(storagePathFromUrl).filter((p): p is string => p !== null)
}

export async function createPlant(input: PlantPayload): Promise<ActionResult> {
  const auth = await getAuthed()
  if (!auth) return NO_SESSION
  const { supabase } = auth

  const parsed = plantPayloadSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  if (!parsed.data.image_urls.every(isOwnImageUrl)) return { ok: false, error: 'Alguna imagen no es válida.' }

  const { error: insertError } = await supabase.from('plants').insert({
    name: parsed.data.name,
    description: parsed.data.description,
    category: parsed.data.category,
    price: parsed.data.price,
    precio_oferta: parsed.data.precio_oferta,
    available: parsed.data.available,
    image_urls: parsed.data.image_urls,
  })

  if (insertError) {
    await supabase.storage.from(BUCKET).remove(pathsFromUrls(parsed.data.image_urls)) // best-effort
    return { ok: false, error: 'No se pudo guardar la planta.' }
  }

  revalidateAll()
  return { ok: true }
}

export async function updatePlant(id: string, input: PlantPayload): Promise<ActionResult> {
  const auth = await getAuthed()
  if (!auth) return NO_SESSION
  const { supabase } = auth

  if (!idSchema.safeParse(id).success) return { ok: false, error: 'Identificador inválido.' }

  const parsed = plantPayloadSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  if (!parsed.data.image_urls.every(isOwnImageUrl)) return { ok: false, error: 'Alguna imagen no es válida.' }

  const { data: existing, error: fetchError } = await supabase
    .from('plants')
    .select('image_urls')
    .eq('id', id)
    .maybeSingle()
  if (fetchError || !existing) return { ok: false, error: 'No se encontró la planta.' }

  const oldUrls = (existing as { image_urls: string[] }).image_urls ?? []
  const finalUrls = parsed.data.image_urls
  const addedUrls = finalUrls.filter((u) => !oldUrls.includes(u))
  const removedUrls = oldUrls.filter((u) => !finalUrls.includes(u))

  const { data: updated, error: updateError } = await supabase
    .from('plants')
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category,
      price: parsed.data.price,
      precio_oferta: parsed.data.precio_oferta,
      available: parsed.data.available,
      image_urls: finalUrls,
    })
    .eq('id', id)
    .select('id')

  if (updateError || !updated || updated.length === 0) {
    if (addedUrls.length > 0) await supabase.storage.from(BUCKET).remove(pathsFromUrls(addedUrls)) // best-effort
    return { ok: false, error: 'No se pudo actualizar la planta.' }
  }

  if (removedUrls.length > 0) await supabase.storage.from(BUCKET).remove(pathsFromUrls(removedUrls)) // best-effort

  revalidateAll()
  return { ok: true }
}

export async function toggleAvailable(id: string, available: boolean): Promise<ActionResult> {
  const auth = await getAuthed()
  if (!auth) return NO_SESSION
  if (!idSchema.safeParse(id).success) return { ok: false, error: 'Identificador inválido.' }

  const { data, error } = await auth.supabase.from('plants').update({ available }).eq('id', id).select('id')
  if (error || !data || data.length === 0) return { ok: false, error: 'No se pudo cambiar el estado.' }

  revalidateAll()
  return { ok: true }
}

export async function deletePlant(id: string): Promise<ActionResult> {
  const auth = await getAuthed()
  if (!auth) return NO_SESSION
  const { supabase } = auth

  if (!idSchema.safeParse(id).success) return { ok: false, error: 'Identificador inválido.' }

  const { data: existing, error: fetchError } = await supabase
    .from('plants')
    .select('image_urls')
    .eq('id', id)
    .maybeSingle()
  if (fetchError || !existing) return { ok: false, error: 'No se encontró la planta.' }

  const paths = pathsFromUrls((existing as { image_urls: string[] }).image_urls ?? [])
  if (paths.length > 0) {
    const { error: removeError } = await supabase.storage.from(BUCKET).remove(paths)
    if (removeError) return { ok: false, error: 'No se pudieron borrar las imágenes; la planta no fue eliminada.' }
  }

  const { data: deleted, error: deleteError } = await supabase.from('plants').delete().eq('id', id).select('id')
  if (deleteError || !deleted || deleted.length === 0) return { ok: false, error: 'No se pudo eliminar la planta.' }

  revalidateAll()
  return { ok: true }
}
