// lib/utils.ts
export function formatPrice(value: number): string {
  return new Intl.NumberFormat(process.env.NEXT_PUBLIC_LOCALE ?? 'es-EC', {
    style: 'currency',
    currency: process.env.NEXT_PUBLIC_CURRENCY ?? 'USD',
  }).format(value)
}

/** ¿La planta tiene una oferta válida (menor al precio normal)? */
export function hasOffer(plant: { price: number; precio_oferta: number | null }): boolean {
  return plant.precio_oferta !== null && plant.precio_oferta < plant.price
}

/** Precio vigente: el de oferta si existe, si no el normal. */
export function currentPrice(plant: { price: number; precio_oferta: number | null }): number {
  return hasOffer(plant) && plant.precio_oferta !== null ? plant.precio_oferta : plant.price
}

export function whatsappNumber(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
}

export function buildWhatsAppUrl(plantName: string, formattedPrice: string): string {
  const text = `Hola El Jardín de la China, me interesa comprar la planta ${plantName} que cuesta ${formattedPrice}. ¿Tienen disponibilidad?`
  return `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(text)}`
}

export function slugify(input: string): string {
  const slug = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return slug || 'planta'
}

const PUBLIC_MARKER = '/storage/v1/object/public/plantas/'

/** Extrae la ruta del objeto en el bucket a partir de su URL pública. */
export function storagePathFromUrl(url: string | null): string | null {
  if (!url) return null
  const idx = url.indexOf(PUBLIC_MARKER)
  if (idx === -1) return null
  return decodeURIComponent(url.slice(idx + PUBLIC_MARKER.length).split('?')[0])
}
