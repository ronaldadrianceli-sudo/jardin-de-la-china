// lib/types.ts
export type Category = 'palmas' | 'interior' | 'otras'

export interface Plant {
  id: string
  name: string
  description: string | null
  category: Category
  price: number
  precio_oferta: number | null
  available: boolean
  image_urls: string[]
  created_at: string
  updated_at: string
}

export type ActionResult = { ok: true } | { ok: false; error: string }

export interface SiteSettings {
  logo_url: string | null
}
