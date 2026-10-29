// lib/constants.ts
import type { Category } from '@/lib/types'

export const CATEGORIES = ['palmas', 'interior', 'otras'] as const

export const CATEGORY_LABELS: Record<Category, string> = {
  palmas: 'Palmas',
  interior: 'Plantas de Interior',
  otras: 'Otras',
}

export const BUCKET = 'plantas'
export const MAX_IMAGES = 8
export const LOGO_PREFIX = 'logo/' // carpeta del logo dentro del bucket
export const MAX_LOGO_BYTES = 1024 * 1024 // 1 MB
// Segundos de caché de datos públicos (se invalida al instante con revalidateTag en cada cambio)
export const REVALIDATE_SECONDS = 300
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const
export const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
