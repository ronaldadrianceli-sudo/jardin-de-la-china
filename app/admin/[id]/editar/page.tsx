// app/admin/[id]/editar/page.tsx
import { notFound } from 'next/navigation'
import AdminHeader from '@/components/AdminHeader'
import PlantForm from '@/components/PlantForm'
import { requireUser } from '@/lib/auth'
import type { Plant } from '@/lib/types'

export const metadata = { title: 'Editar planta | Admin', robots: { index: false } }

export default async function EditPlantPage({ params }: { params: { id: string } }) {
  const { supabase } = await requireUser()
  const { data, error } = await supabase.from('plants').select('*').eq('id', params.id).maybeSingle()
  if (error || !data) notFound()

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 font-display text-2xl text-brand-dark">Editar planta</h1>
        <PlantForm plant={data as Plant} />
      </main>
    </>
  )
}
