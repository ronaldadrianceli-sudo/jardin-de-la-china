// components/SiteLogo.tsx  — fuente única del logo para Header, Footer y Login.
import Image from 'next/image'
import { Sprout } from 'lucide-react'

const SIZES = {
  sm: { px: 56, box: 'h-14 w-14' },
  md: { px: 112, box: 'h-28 w-28' },
  lg: { px: 128, box: 'h-32 w-32' },
} as const

export default function SiteLogo({
  logoUrl,
  size = 'sm',
  priority = false,
}: {
  logoUrl: string | null
  size?: keyof typeof SIZES
  priority?: boolean
}) {
  const { px, box } = SIZES[size]

  if (!logoUrl) {
    // Sin logo configurado: icono genérico (el nombre del vivero se muestra aparte).
    return (
      <span
        aria-hidden="true"
        className={`${box} flex shrink-0 items-center justify-center rounded-full bg-brand-primary text-white ring-2 ring-brand-wood`}
      >
        <Sprout className="h-1/2 w-1/2" />
      </span>
    )
  }

  return (
    <Image
      src={logoUrl}
      alt="Logo de El Jardín de la China"
      width={px}
      height={px}
      priority={priority}
      className={`${box} aspect-square shrink-0 rounded-full bg-white object-cover ring-2 ring-brand-wood`}
    />
  )
}
