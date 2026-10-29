// components/Lightbox.tsx
'use client'

import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface LightboxProps {
  images: string[]
  alt: string
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}

export default function Lightbox({ images, alt, index, onIndexChange, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const total = images.length

  const prev = useCallback(() => onIndexChange((index - 1 + total) % total), [index, total, onIndexChange])
  const next = useCallback(() => onIndexChange((index + 1) % total), [index, total, onIndexChange])

  // Bloquea el scroll de fondo y devuelve el foco al elemento que abrió el modal.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = originalOverflow
      previouslyFocused?.focus()
    }
  }, [])

  // Teclado: Esc cierra, flechas navegan, Tab queda atrapado dentro del modal.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && total > 1) {
        prev()
      } else if (e.key === 'ArrowRight' && total > 1) {
        next()
      } else if (e.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('button')
        if (!focusables || focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, prev, next, total])

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${alt}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-label="Cerrar"
        className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25 focus-ring"
      >
        <X className="h-6 w-6" aria-hidden="true" />
      </button>

      {total > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            prev()
          }}
          aria-label="Foto anterior"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25 focus-ring"
        >
          <ChevronLeft className="h-7 w-7" aria-hidden="true" />
        </button>
      )}

      <div className="relative h-[80vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <Image
          src={images[index]}
          alt={`${alt} (foto ${index + 1} de ${total})`}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            aria-label="Foto siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25 focus-ring"
          >
            <ChevronRight className="h-7 w-7" aria-hidden="true" />
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white" aria-live="polite">
            {index + 1} / {total}
          </p>
        </>
      )}
    </div>,
    document.body
  )
}
