// app/loading.tsx
import SiteHeader from '@/components/SiteHeader'

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8" aria-busy="true" aria-label="Cargando catálogo">
        <div className="mb-6 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-brand-wood/40" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-white ring-1 ring-brand-wood/40">
              <div className="aspect-[4/5] animate-pulse bg-brand-wood/30" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-2/3 animate-pulse rounded bg-brand-wood/40" />
                <div className="h-4 w-full animate-pulse rounded bg-brand-wood/30" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-brand-wood/40" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
