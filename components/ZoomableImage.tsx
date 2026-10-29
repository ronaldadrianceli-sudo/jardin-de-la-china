// components/ZoomableImage.tsx
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { ZoomIn } from 'lucide-react'

// El lightbox sólo se descarga cuando alguien hace clic en una foto.
const Lightbox = dynamic(() => import('@/components/Lightbox'), { ssr: false })

/** Imagen de portada que ocupa su contenedor `relative`; al hacer clic abre el lightbox. */
export default function ZoomableImage({
  images,
  alt,
  sizes,
  priority = false,
}: {
  images: string[]
  alt: string
  sizes: string
  priority?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  if (images.length === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIndex(0)
          setOpen(true)
        }}
        aria-label={`Ampliar foto de ${alt}`}
        className="group absolute inset-0 block cursor-zoom-in focus-ring"
      >
        <Image src={images[0]} alt={alt} fill sizes={sizes} priority={priority} className="object-cover transition duration-300 group-hover:scale-105" />
        <span className="absolute bottom-3 right-3 rounded-full bg-black/50 p-2 text-white" aria-hidden="true">
          <ZoomIn className="h-4 w-4" />
        </span>
      </button>
      {open && <Lightbox images={images} alt={alt} index={index} onIndexChange={setIndex} onClose={() => setOpen(false)} />}
    </>
  )
}
