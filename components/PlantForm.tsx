// components/PlantForm.tsx
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, ImagePlus, X } from 'lucide-react'
import { createPlant, updatePlant } from '@/lib/actions/plants'
import { BUCKET, CATEGORIES, CATEGORY_LABELS, MAX_IMAGES, MIME_EXT } from '@/lib/constants'
import { optimizeImage } from '@/lib/image-compress'
import { plainToHtml } from '@/lib/richtext'
import { createClient } from '@/lib/supabase/client'
import type { Plant } from '@/lib/types'
import { slugify } from '@/lib/utils'
import { plantSchema, validateImage, type PlantInput } from '@/lib/validation'
import Spinner from '@/components/Spinner'

// El editor (Tiptap) se descarga sólo en esta pantalla y sólo en el navegador.
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-52 animate-pulse rounded-xl bg-brand-wood/30" aria-busy="true" />,
})

type Item =
  | { id: string; kind: 'existing'; url: string }
  | { id: string; kind: 'new'; file: File; preview: string }

function parseOptionalNumber(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

export default function PlantForm({ plant }: { plant?: Plant }) {
  const router = useRouter()
  const isEdit = Boolean(plant)

  const [items, setItems] = useState<Item[]>(() =>
    (plant?.image_urls ?? []).map((url) => ({ id: url, kind: 'existing' as const, url }))
  )
  const [imageError, setImageError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PlantInput>({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      name: plant?.name ?? '',
      description: plainToHtml(plant?.description ?? ''),
      category: plant?.category ?? 'palmas',
      price: plant?.price,
      precio_oferta: plant?.precio_oferta ?? null,
      available: plant?.available ?? true,
    },
  })

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = '' // permite volver a elegir el mismo archivo

    const room = MAX_IMAGES - items.length
    const problems: string[] = []
    const accepted: Item[] = []

    for (const file of files) {
      const err = validateImage(file)
      if (err) {
        problems.push(`${file.name}: ${err}`)
        continue
      }
      if (accepted.length >= room) {
        problems.push(`Máximo ${MAX_IMAGES} fotos por planta.`)
        break
      }
      accepted.push({ id: crypto.randomUUID(), kind: 'new', file, preview: URL.createObjectURL(file) })
    }

    setImageError(problems.length > 0 ? problems.join(' ') : null)
    if (accepted.length > 0) setItems((prev) => [...prev, ...accepted])
  }

  function move(index: number, delta: -1 | 1) {
    setItems((prev) => {
      const target = index + delta
      if (target < 0 || target >= prev.length) return prev
      const copy = [...prev]
      ;[copy[index], copy[target]] = [copy[target], copy[index]]
      return copy
    })
  }

  function remove(index: number) {
    setItems((prev) => {
      const item = prev[index]
      if (item?.kind === 'new') URL.revokeObjectURL(item.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function onSubmit(values: PlantInput) {
    setServerError(null)
    if (items.length === 0) {
      setImageError('Agrega al menos una foto.')
      return
    }
    setImageError(null)

    const supabase = createClient()
    const uploadedPaths: string[] = []

    async function cleanupUploads() {
      if (uploadedPaths.length === 0) return
      try {
        await supabase.storage.from(BUCKET).remove(uploadedPaths) // best-effort
      } catch {
        // se ignora: sólo limpieza
      }
    }

    try {
      const urls: string[] = []
      for (const item of items) {
        if (item.kind === 'existing') {
          urls.push(item.url)
          continue
        }
        const file = await optimizeImage(item.file) // máx. 1600 px y WebP: sube menos y carga más rápido
        const path = `${crypto.randomUUID()}-${slugify(values.name)}.${MIME_EXT[file.type] ?? 'webp'}`
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false, cacheControl: '31536000' })
        if (error) throw new Error('No se pudo subir una de las imágenes. Intenta de nuevo.')
        uploadedPaths.push(path)
        urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
      }

      const payload = { ...values, image_urls: urls }
      const res = plant ? await updatePlant(plant.id, payload) : await createPlant(payload)
      if (!res.ok) {
        await cleanupUploads()
        setServerError(res.error)
        return
      }

      items.forEach((item) => {
        if (item.kind === 'new') URL.revokeObjectURL(item.preview)
      })
      router.push('/admin')
      router.refresh()
    } catch (err) {
      await cleanupUploads()
      setServerError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-wood/40"
      noValidate
    >
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">Nombre</label>
        <input id="name" type="text" className="input" aria-invalid={!!errors.name} {...register('name')} />
        {errors.name && <p role="alert" className="mt-1 text-sm text-red-700">{errors.name.message}</p>}
      </div>

      <div>
        <span id="description-label" className="mb-1 block text-sm font-medium">Descripción</span>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              labelledBy="description-label"
              disabled={isSubmitting}
              invalid={!!errors.description}
            />
          )}
        />
        {errors.description && <p role="alert" className="mt-1 text-sm text-red-700">{errors.description.message}</p>}
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium">Categoría</label>
        <select id="category" className="input" {...register('category')}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        {errors.category && <p role="alert" className="mt-1 text-sm text-red-700">{errors.category.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium">
            Precio ({process.env.NEXT_PUBLIC_CURRENCY ?? 'USD'})
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            className="input"
            aria-invalid={!!errors.price}
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && <p role="alert" className="mt-1 text-sm text-red-700">{errors.price.message}</p>}
        </div>
        <div>
          <label htmlFor="precio_oferta" className="mb-1 block text-sm font-medium">Precio de oferta (opcional)</label>
          <input
            id="precio_oferta"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            className="input"
            aria-invalid={!!errors.precio_oferta}
            aria-describedby="oferta-ayuda"
            {...register('precio_oferta', { setValueAs: parseOptionalNumber })}
          />
          <p id="oferta-ayuda" className="mt-1 text-xs text-brand-dark/70">
            Déjalo vacío si no está en oferta. Debe ser menor al precio normal.
          </p>
          {errors.precio_oferta && <p role="alert" className="mt-1 text-sm text-red-700">{errors.precio_oferta.message}</p>}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input type="checkbox" role="switch" className="peer sr-only" {...register('available')} />
        <span className="relative h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-brand-primary peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary peer-focus-visible:ring-offset-2 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition after:content-[''] peer-checked:after:translate-x-5" />
        <span className="text-sm font-medium">Disponible</span>
      </label>

      <div>
        <label htmlFor="images" className="mb-1 block text-sm font-medium">
          Fotos ({items.length}/{MAX_IMAGES}) — la primera es la portada del catálogo
        </label>

        {items.length > 0 && (
          <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {items.map((item, i) => (
              <li key={item.id} className="rounded-xl bg-brand-cream p-2 ring-1 ring-brand-wood/50">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-white">
                  <Image
                    src={item.kind === 'existing' ? item.url : item.preview}
                    alt={`Foto ${i + 1}`}
                    fill
                    sizes="150px"
                    unoptimized={item.kind === 'new'}
                    className="object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                      Portada
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0 || isSubmitting}
                    aria-label={`Mover foto ${i + 1} a la izquierda`}
                    className="btn-secondary px-2 py-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    disabled={isSubmitting}
                    aria-label={`Quitar foto ${i + 1}`}
                    className="btn-secondary px-2 py-1.5"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1 || isSubmitting}
                    aria-label={`Mover foto ${i + 1} a la derecha`}
                    className="btn-secondary px-2 py-1.5"
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-3">
          <ImagePlus className="h-6 w-6 shrink-0 text-brand-brown/60" aria-hidden="true" />
          <input
            id="images"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={onFilesChange}
            disabled={isSubmitting || items.length >= MAX_IMAGES}
            className="block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-brand-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-dark"
          />
        </div>
        <p className="mt-1 text-xs text-brand-dark/70">
          Puedes elegir varias a la vez. JPG, PNG o WebP, máximo 5 MB cada una. Recomendado vertical 4:5.
        </p>
        {imageError && <p role="alert" className="mt-1 text-sm text-red-700">{imageError}</p>}
      </div>

      {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{serverError}</p>}

      <div className="flex justify-end gap-2">
        <Link href="/admin" className="btn-secondary">Cancelar</Link>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting && <Spinner />}
          {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear planta'}
        </button>
      </div>
    </form>
  )
}
