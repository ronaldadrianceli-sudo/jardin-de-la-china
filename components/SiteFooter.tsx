// components/SiteFooter.tsx
import { MessageCircle } from 'lucide-react'
import SiteLogo from '@/components/SiteLogo'
import { getSiteSettings } from '@/lib/data'
import { whatsappNumber } from '@/lib/utils'

// Lucide 1.x no incluye iconos de marca: SVG propio.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
    </svg>
  )
}

export default async function SiteFooter() {
  const { logo_url } = await getSiteSettings()
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL
  const wa = `https://wa.me/${whatsappNumber()}`

  return (
    <footer className="mt-16 border-t border-brand-wood/50 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 text-center">
        <SiteLogo logoUrl={logo_url} size="lg" />
        <div className="flex flex-wrap justify-center gap-3">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Escríbenos por WhatsApp
          </a>
          {instagram ? (
            <a href={instagram} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <InstagramIcon className="h-4 w-4" /> Instagram
            </a>
          ) : null}
        </div>
        <p className="text-sm text-brand-dark/70">
          © {new Date().getFullYear()} El Jardín de la China. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
