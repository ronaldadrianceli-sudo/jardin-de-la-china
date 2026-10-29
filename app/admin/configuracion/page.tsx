// app/admin/configuracion/page.tsx
import AdminHeader from '@/components/AdminHeader'
import LogoForm from '@/components/LogoForm'
import { requireUser } from '@/lib/auth'

export const metadata = { title: 'Configuración | Admin', robots: { index: false } }

export default async function SettingsPage() {
  const { supabase } = await requireUser()
  const { data } = await supabase.from('site_settings').select('logo_url').eq('id', 1).maybeSingle()
  const logoUrl = (data as { logo_url: string | null } | null)?.logo_url ?? null

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 font-display text-2xl text-brand-dark">Configuración del sitio</h1>
        <LogoForm currentLogoUrl={logoUrl} />
      </main>
    </>
  )
}
