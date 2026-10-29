// components/DeleteButton.tsx
'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deletePlant } from '@/lib/actions/plants'
import Spinner from '@/components/Spinner'

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirmDelete() {
    if (pending) return
    setPending(true)
    setError(null)
    const res = await deletePlant(id)
    setPending(false)
    if (res.ok) setOpen(false)
    else setError(res.error)
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={`Eliminar ${name}`} className="btn-secondary px-3">
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby={`del-${id}`} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 id={`del-${id}`} className="font-display text-xl text-brand-dark">¿Eliminar planta?</h2>
            <p className="mt-2 text-sm text-brand-dark/80">
              Se eliminará «{name}» y su imagen. Esta acción no se puede deshacer.
            </p>
            {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} disabled={pending} className="btn-secondary">Cancelar</button>
              <button type="button" onClick={confirmDelete} disabled={pending} className="btn-danger">
                {pending && <Spinner />} Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
