// app/page.tsx
import CategoryFilter from '@/components/CategoryFilter'
import PlantCard from '@/components/PlantCard'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import { CATEGORIES } from '@/lib/constants'
import { getPlants } from '@/lib/data'
import type { Category } from '@/lib/types'

function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value)
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { categoria?: string | string[] }
}) {
  const active = isCategory(searchParams.categoria) ? searchParams.categoria : undefined

  // Lectura cacheada (Data Cache, 5 min; se invalida al editar). Sin consulta a la BD por visita.
  const plants = await getPlants(active)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <CategoryFilter active={active} />
        </div>

        {plants.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-brand-wood/40">
            <p className="text-4xl" aria-hidden="true">🌱</p>
            <p className="mt-3 font-display text-xl text-brand-dark">Aún no hay plantas en esta categoría</p>
            <p className="mt-1 text-sm text-brand-dark/70">Vuelve pronto, estamos sembrando novedades.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {plants.map((plant, index) => (
              <PlantCard key={plant.id} plant={plant} priority={index < 2} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
