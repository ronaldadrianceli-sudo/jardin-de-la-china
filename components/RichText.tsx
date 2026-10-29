// components/RichText.tsx  — Server Component. Renderiza HTML SANITIZADO (anti-XSS).
import sanitizeHtml from 'sanitize-html'
import { plainToHtml } from '@/lib/richtext'

// Lista blanca estricta: sólo lo que ofrece el editor. Todo lo demás (script, img, a, on*=, style
// arbitrario, javascript:) se descarta.
export function sanitizeDescription(html: string): string {
  return sanitizeHtml(plainToHtml(html), {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'h2', 'h3', 'ul', 'ol', 'li'],
    allowedAttributes: { p: ['style'], h2: ['style'], h3: ['style'], li: ['style'] },
    allowedStyles: { '*': { 'text-align': [/^(left|right|center|justify)$/] } },
    disallowedTagsMode: 'discard',
  })
}

export default function RichText({ html }: { html: string }) {
  return <div className="rich-text" dangerouslySetInnerHTML={{ __html: sanitizeDescription(html) }} />
}
