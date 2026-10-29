// components/StatusToggle.tsx
'use client'

import { useEffect, useState } from 'react'
import { toggleAvailable } from '@/lib/actions/plants'
import Spinner from '@/components/Spinner'

export default function StatusToggle({ id, name, available }: { id: string; name: string; available: boolean }) {
  const [checked, setChecked] = useState(available)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setChecked(available), [available])

  async function onClick() {
    if (pending) return
    const next = !checked
    setChecked(next) // update optimista
    setError(null)
    setPending(true)
    const res = await toggleAvailable(id, next)
    if (!res.ok) {
      setChecked(!next) // revertir
      setError(res.error)
    }
    setPending(false)
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={`Disponibilidad de ${name}`}
          disabled={pending}
          onClick={onClick}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-60 focus-ring ${
            checked ? 'bg-brand-primary' : 'bg-gray-300'
          }`}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
        <span className="text-xs">{checked ? 'Disponible' : 'Agotado'}</span>
        {pending && <Spinner />}
      </div>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  )
}
