// components/LogoutButton.tsx
'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import Spinner from '@/components/Spinner'

export default function LogoutButton() {
  const [pending, setPending] = useState(false)

  async function onClick() {
    if (pending) return
    setPending(true)
    await logout() // redirige a /login
  }

  return (
    <button type="button" onClick={onClick} disabled={pending} className="btn-secondary">
      {pending ? <Spinner /> : <LogOut className="h-4 w-4" aria-hidden="true" />} Cerrar sesión
    </button>
  )
}
