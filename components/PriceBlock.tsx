// components/PriceBlock.tsx
import type { Plant } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg'

export default function PriceBlock({
  plant,
  size = 'md',
}: {
  plant: Pick<Plant, 'price' | 'precio_oferta'>
  size?: Size
}) {
  const main = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-base' : 'text-2xl'
  const old = size === 'lg' ? 'text-lg' : 'text-sm'
  const offer = plant.precio_oferta

  if (offer === null || offer >= plant.price) {
    return <p className={`${main} font-bold text-brand-brown`}>{formatPrice(plant.price)}</p>
  }

  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className="sr-only">Precio de oferta:</span>
      <span className={`${main} font-bold text-red-700`}>{formatPrice(offer)}</span>
      <span className="sr-only">Precio original:</span>
      <span className={`${old} text-brand-dark/60 line-through`}>{formatPrice(plant.price)}</span>
    </p>
  )
}
