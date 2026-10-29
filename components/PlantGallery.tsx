// components/PlantGallery.tsx
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { ImageOff, ZoomIn } from 'lucide-react'

const Lightbox = dynamic(() => import('@/components/Lightbox'), { ssr: false })

export default function PlantGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-white text-brand-brown/50 ring-1 ring-brand-wood/40">
        <ImageOff className="h-10 w-10" aria-hidden="true" />
        <span className="sr-only">Sin fotos</span>
      </div>
    )
  }

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-brand-wood/40">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Ampliar foto ${index + 1} de ${alt}`}
          className="group absolute inset-0 block cursor-zoom-in focus-ring"
        >
          <Image
            src={images[index]}
            alt={`${alt} (foto ${index + 1} de ${images.length})`}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 p-2 text-white" aria-hidden="true">
            <ZoomIn className="h-5 w-5" />
          </span>
        </button>
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Miniaturas">
          {images.map((url, i) => (
            <li key={url} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                className={`relative block h-20 w-16 overflow-hidden rounded-xl bg-white focus-ring ${
                  i === index ? 'ring-2 ring-brand-primary' : 'ring-1 ring-brand-wood/60 opacity-80 hover:opacity-100'
                }`}
              >
                <Image src={url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && <Lightbox images={images} alt={alt} index={index} onIndexChange={setIndex} onClose={() => setOpen(false)} />}
    </div>
  )
}
