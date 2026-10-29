// lib/richtext.ts  (sin dependencias; usable en cliente y servidor)

const HTML_HINT = /<\/?(p|h[1-6]|ul|ol|li|strong|em|b|i|br|div|span)\b[^>]*>/i

export function looksLikeHtml(value: string): boolean {
  return HTML_HINT.test(value)
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Convierte texto plano antiguo (v0.1/v0.2) a HTML; si ya es HTML lo deja igual. */
export function plainToHtml(value: string): string {
  if (!value) return ''
  if (looksLikeHtml(value)) return value
  return value
    .trim()
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

/** Texto sin etiquetas (para tarjetas, metadatos y validación de longitud). */
export function htmlToText(value: string): string {
  if (!value) return ''
  if (!looksLikeHtml(value)) return value.replace(/\s+/g, ' ').trim()
  return value
    .replace(/<\/(p|h[1-6]|li|div)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}
