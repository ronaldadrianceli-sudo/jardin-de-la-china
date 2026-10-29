// app/plantas/[id]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { z } from 'zod'
import PlantGallery from '@/components/PlantGallery'
import PriceBlock from '@/components/PriceBlock'
import RichText from '@/components/RichText'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import WhatsAppButton from '@/components/WhatsAppButton'
import { CATEGORY_LABELS } from '@/lib/constants'
import { getPlant } from '@/lib/data'
import { htmlToText } from '@/lib/richtext'
import type { Plant } from '@/lib/types'
import { hasOffer } from '@/lib/utils'

const idSchema = z.string().uuid()

// ISR: sin cookies ni searchParams en esta ruta, así que Next la cachea y la regenera cada 5 min
// (o al instante cuando un Server Action llama a revalidateTag/revalidatePath).
export const revalidate = 300

// Lista vacía: no se prerenderiza nada en el build, pero cada ficha se genera en la primera visita
// y queda en caché (ISR bajo demanda). Sin esto Next la trata como totalmente dinámica.
export function generateStaticParams(): { id: string }[] {
  return []
}

async function loadPlant(id: string): Promise<Plant | null> {
  if (!idSchema.safeParse(id).success) return null
  return getPlant(id)
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const plant = await loadPlant(params.id)
  if (!plant) return { title: 'Planta no encontrada | El Jardín de la China' }

  const description = htmlToText(plant.description ?? '').slice(0, 160)
  return {
    title: `${plant.name} | El Jardín de la China`,
    description,
    openGraph: {
      title: plant.name,
      description,
      type: 'website',
      images: plant.image_urls[0] ? [{ url: plant.image_urls[0], alt: plant.name }] : undefined,
    },
  }
}

export default async function PlantDetailPage({ params }: { params: { id: string } }) {
  const plant = await loadPlant(params.id)
  if (!plant) notFound()

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded text-sm font-medium text-brand-primary hover:underline focus-ring">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver al catálogo
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <PlantGallery images={plant.image_urls} alt={plant.name} />

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  plant.available ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-800'
                }`}
              >
                {plant.available ? 'Disponible' : 'Agotado'}
              </span>
              {hasOffer(plant) && (
                <span className="rounded-full bg-red-700 px-3 py-1 text-xs font-bold text-white">¡Oferta!</span>
              )}
              <span className="text-xs text-brand-dark/70">{CATEGORY_LABELS[plant.category]}</span>
            </div>

            <h1 className="font-display text-3xl font-semibold text-brand-dark">{plant.name}</h1>

            <PriceBlock plant={plant} size="lg" />

            {plant.description && <RichText html={plant.description} />}

            <div className="mt-2 max-w-sm">
              <WhatsAppButton plant={plant} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
