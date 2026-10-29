// components/PlantCard.tsx
// Server Component: NO agregar manejadores de eventos aquí (usar componentes cliente hijos).
import Link from 'next/link'
import { ImageOff } from 'lucide-react'
import PriceBlock from '@/components/PriceBlock'
import WhatsAppButton from '@/components/WhatsAppButton'
import ZoomableImage from '@/components/ZoomableImage'
import type { Plant } from '@/lib/types'
import { htmlToText } from '@/lib/richtext'
import { hasOffer } from '@/lib/utils'

export default function PlantCard({ plant, priority = false }: { plant: Plant; priority?: boolean }) {
  const detailHref = `/plantas/${plant.id}`

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-brand-wood/40">
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-cream">
        {plant.image_urls.length > 0 ? (
          <ZoomableImage
            images={plant.image_urls}
            alt={plant.name}
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-brown/40">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
            <span className="sr-only">Sin foto</span>
          </div>
        )}
        <span
          className={`pointer-events-none absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
            plant.available ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-800'
          }`}
        >
          {plant.available ? 'Disponible' : 'Agotado'}
        </span>
        {hasOffer(plant) && (
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-red-700 px-3 py-1 text-xs font-bold text-white">
            ¡Oferta!
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-display text-lg font-semibold text-brand-dark">
          <Link href={detailHref} className="rounded hover:underline focus-ring">
            {plant.name}
          </Link>
        </h2>
        <p className="line-clamp-2 text-sm text-brand-dark/80">{htmlToText(plant.description ?? '')}</p>
        <div className="mt-auto pt-2">
          <PriceBlock plant={plant} />
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <Link href={detailHref} className="btn-secondary w-full">
            Ver detalles
          </Link>
          <WhatsAppButton plant={plant} />
        </div>
      </div>
    </article>
  )
}
