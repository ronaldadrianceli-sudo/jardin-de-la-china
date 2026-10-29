// components/AdminHeader.tsx
import Link from 'next/link'
import { Settings } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

export default function AdminHeader() {
  return (
    <header className="border-b border-brand-wood/50 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/admin" className="rounded-xl font-display text-xl font-semibold text-brand-dark focus-ring">
          Admin · El Jardín de la China
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/admin/configuracion" className="btn-secondary">
            <Settings className="h-4 w-4" aria-hidden="true" /> Configuración
          </Link>
          <Link href="/" className="btn-secondary" target="_blank" rel="noopener noreferrer">Ver catálogo</Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
