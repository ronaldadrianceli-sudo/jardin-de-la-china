// components/LogoForm.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { removeLogo, updateLogo } from '@/lib/actions/settings'
import { ALLOWED_MIME, BUCKET, LOGO_PREFIX, MAX_LOGO_BYTES, MIME_EXT } from '@/lib/constants'
import { optimizeImage } from '@/lib/image-compress'
import { createClient } from '@/lib/supabase/client'
import SiteLogo from '@/components/SiteLogo'
import Spinner from '@/components/Spinner'

export default function LogoForm({ currentLogoUrl }: { currentLogoUrl: string | null }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setError(null)
    setSuccess(null)
    setWarning(null)

    if (!f) {
      setFile(null)
      setPreview(null)
      return
    }
    if (!(ALLOWED_MIME as readonly string[]).includes(f.type)) {
      setError('Formato no permitido. Usa JPG, PNG o WebP.')
      e.target.value = ''
      return
    }
    if (f.size > MAX_LOGO_BYTES) {
      setError('El logo supera 1 MB. Reduce su tamaño e inténtalo de nuevo.')
      e.target.value = ''
      return
    }

    const url = URL.createObjectURL(f)
    const probe = new window.Image()
    probe.onload = () => {
      const ratio = Math.abs(probe.naturalWidth - probe.naturalHeight) / Math.max(probe.naturalWidth, probe.naturalHeight)
      if (ratio > 0.1) setWarning('La imagen no es cuadrada: se recortará al centro para verse en círculo.')
      else if (probe.naturalWidth < 256) setWarning('La imagen es pequeña; se verá borrosa. Usa 512×512 px.')
    }
    probe.src = url

    setFile(f)
    setPreview(url)
  }

  async function onSave() {
    if (!file || pending) return
    setPending(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()
    let uploadedPath: string | null = null
    try {
      const optimized = await optimizeImage(file, 1024)
      const path = `${LOGO_PREFIX}${crypto.randomUUID()}.${MIME_EXT[optimized.type] ?? 'webp'}`
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, optimized, { contentType: optimized.type, upsert: false, cacheControl: '31536000' })
      if (uploadError) throw new Error('No se pudo subir el logo. Intenta de nuevo.')
      uploadedPath = path

      const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
      const res = await updateLogo(url)
      if (!res.ok) {
        await supabase.storage.from(BUCKET).remove([path]) // best-effort
        setError(res.error)
        return
      }

      setSuccess('Logo actualizado. Ya se ve en el encabezado y el pie de página.')
      setFile(null)
      setPreview(null)
      router.refresh()
    } catch (err) {
      if (uploadedPath) {
        try {
          await supabase.storage.from(BUCKET).remove([uploadedPath])
        } catch {
          // sólo limpieza
        }
      }
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.')
    } finally {
      setPending(false)
    }
  }

  async function onRemove() {
    if (pending) return
    setPending(true)
    setError(null)
    setSuccess(null)
    const res = await removeLogo()
    setPending(false)
    setConfirmRemove(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setSuccess('Logo quitado. Se mostrará el icono por defecto.')
    router.refresh()
  }

  return (
    <section aria-labelledby="logo-title" className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-wood/40">
      <h2 id="logo-title" className="font-display text-xl text-brand-dark">Logo del sitio</h2>

      <div className="flex flex-wrap items-center gap-6">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-brown">Actual</p>
          <SiteLogo logoUrl={currentLogoUrl} size="md" />
        </div>
        {preview && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-brown">Nuevo (vista previa)</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Vista previa del nuevo logo"
              className="aspect-square h-28 w-28 rounded-full bg-white object-cover ring-2 ring-brand-wood"
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="logo" className="mb-1 block text-sm font-medium">Subir nuevo logo</label>
        <input
          id="logo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
          disabled={pending}
          aria-describedby="logo-help"
          className="block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-brand-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-dark"
        />
        <ul id="logo-help" className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-brand-dark/70">
          <li>Medidas recomendadas: <strong>512 × 512 px</strong> (cuadrado).</li>
          <li>Fondo transparente (PNG) o blanco. Se mostrará recortado en círculo.</li>
          <li>Formatos JPG, PNG o WebP. Máximo <strong>1 MB</strong>.</li>
          <li>Se actualiza automáticamente en el encabezado y en el pie de página.</li>
        </ul>
        {warning && <p role="status" className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{warning}</p>}
        {error && <p role="alert" className="mt-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {success && <p role="status" className="mt-2 rounded-xl bg-green-50 p-3 text-sm text-green-900">{success}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onSave} disabled={!file || pending} className="btn-primary">
          {pending && <Spinner />} Guardar logo
        </button>

        {currentLogoUrl &&
          (confirmRemove ? (
            <>
              <span className="text-sm">¿Quitar el logo actual?</span>
              <button type="button" onClick={onRemove} disabled={pending} className="btn-danger">
                {pending && <Spinner />} Sí, quitar
              </button>
              <button type="button" onClick={() => setConfirmRemove(false)} disabled={pending} className="btn-secondary">
                Cancelar
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setConfirmRemove(true)} disabled={pending} className="btn-secondary">
              Quitar logo
            </button>
          ))}
      </div>
    </section>
  )
}
