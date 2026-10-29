// app/admin/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { Pencil, Plus } from 'lucide-react'
import AdminHeader from '@/components/AdminHeader'
import DeleteButton from '@/components/DeleteButton'
import PriceBlock from '@/components/PriceBlock'
import StatusToggle from '@/components/StatusToggle'
import { requireUser } from '@/lib/auth'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { Plant } from '@/lib/types'

export const metadata = { title: 'Admin | El Jardín de la China', robots: { index: false } }

export default async function AdminPage() {
  const { supabase } = await requireUser()
  const { data, error } = await supabase.from('plants').select('*').order('created_at', { ascending: false })
  const plants = (data ?? []) as Plant[] // cast justificado: sin tipos generados

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl text-brand-dark">Plantas ({plants.length})</h1>
          <Link href="/admin/nueva" className="btn-primary">
            <Plus className="h-4 w-4" aria-hidden="true" /> Agregar Nueva Planta
          </Link>
        </div>

        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">No se pudieron cargar las plantas.</p>}

        {plants.length === 0 && !error ? (
          <p className="rounded-2xl bg-white p-8 text-center ring-1 ring-brand-wood/40">Aún no hay plantas. ¡Agrega la primera! 🌱</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-brand-wood/40">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-cream text-xs uppercase tracking-wide text-brand-brown">
                <tr>
                  <th scope="col" className="px-4 py-3">Imagen</th>
                  <th scope="col" className="px-4 py-3">Nombre</th>
                  <th scope="col" className="px-4 py-3">Categoría</th>
                  <th scope="col" className="px-4 py-3">Precio</th>
                  <th scope="col" className="px-4 py-3">Estado</th>
                  <th scope="col" className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-wood/30">
                {plants.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <div className="relative w-12 overflow-hidden rounded-lg bg-brand-cream" style={{ height: 60 }}>
                        {p.image_urls[0] && <Image src={p.image_urls[0]} alt={p.name} fill sizes="48px" className="object-cover" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">{CATEGORY_LABELS[p.category]}</td>
                    <td className="px-4 py-3"><PriceBlock plant={p} size="sm" /></td>
                    <td className="px-4 py-3"><StatusToggle id={p.id} name={p.name} available={p.available} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/${p.id}/editar`} aria-label={`Editar ${p.name}`} className="btn-secondary px-3">
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <DeleteButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
