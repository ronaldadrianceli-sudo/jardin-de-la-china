// app/login/page.tsx
import { redirect } from 'next/navigation'
import SiteLogo from '@/components/SiteLogo'
import LoginForm from '@/components/LoginForm'
import { getSiteSettings } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Ingresar | El Jardín de la China', robots: { index: false } }

export default async function LoginPage() {
  const supabase = createClient()
  const { logo_url } = await getSiteSettings()
  const { data } = await supabase.auth.getUser()
  if (data.user) redirect('/admin')

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-6 px-4 py-10">
      <SiteLogo logoUrl={logo_url} size="md" priority />
      <div className="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-wood/40">
        <h1 className="mb-4 font-display text-2xl text-brand-dark">Panel de administración</h1>
        <LoginForm />
      </div>
    </main>
  )
}
