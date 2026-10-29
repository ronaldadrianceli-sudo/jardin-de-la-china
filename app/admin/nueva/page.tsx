// app/admin/nueva/page.tsx
import AdminHeader from '@/components/AdminHeader'
import PlantForm from '@/components/PlantForm'
import { requireUser } from '@/lib/auth'

export const metadata = { title: 'Nueva planta | Admin', robots: { index: false } }

export default async function NewPlantPage() {
  await requireUser()
  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 font-display text-2xl text-brand-dark">Agregar nueva planta</h1>
        <PlantForm />
      </main>
    </>
  )
}
