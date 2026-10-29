// lib/image-compress.ts  (sólo navegador)
/**
 * Reduce el peso de una foto antes de subirla: máx. `maxSide` px por lado y WebP.
 * Si algo falla (navegador sin soporte) devuelve el archivo original.
 */
export async function optimizeImage(file: File, maxSide = 1600, quality = 0.85): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return file
    }
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
    if (!blob || blob.type !== 'image/webp') return file
    if (scale === 1 && blob.size >= file.size) return file

    const base = file.name.replace(/\.[^.]+$/, '') || 'imagen'
    return new File([blob], `${base}.webp`, { type: 'image/webp' })
  } catch {
    return file
  }
}
