// components/WhatsAppButton.tsx
import { MessageCircle } from 'lucide-react'
import type { Plant } from '@/lib/types'
import { buildWhatsAppUrl, currentPrice, formatPrice } from '@/lib/utils'

/** Server Component: no debe llevar manejadores de eventos. */
export default function WhatsAppButton({ plant }: { plant: Plant }) {
  if (plant.available) {
    return (
      <a
        href={buildWhatsAppUrl(plant.name, formatPrice(currentPrice(plant)))}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary w-full"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" /> Comprar por WhatsApp
      </a>
    )
  }

  return (
    <div className="group relative">
      <button
        type="button"
        aria-disabled="true"
        aria-label="Producto agotado"
        title="Producto agotado"
        className="btn w-full cursor-not-allowed bg-gray-200 text-gray-600"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" /> Comprar por WhatsApp
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-brand-dark px-3 py-1 text-xs text-white opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100"
      >
        Producto agotado
      </span>
      <p className="mt-1 text-center text-xs text-red-800">Sin stock por ahora</p>
    </div>
  )
}
