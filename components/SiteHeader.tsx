// components/SiteHeader.tsx
import Link from 'next/link'
import SiteLogo from '@/components/SiteLogo'
import { getSiteSettings } from '@/lib/data'

export default async function SiteHeader() {
  const { logo_url } = await getSiteSettings()

  return (
    <header className="border-b border-brand-wood/50 bg-brand-cream">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
        <Link href="/" className="flex items-center gap-3 rounded-xl focus-ring">
          <SiteLogo logoUrl={logo_url} size="sm" priority />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-xl font-semibold text-brand-dark sm:text-2xl">
              El Jardín de la China
            </span>
            <span className="text-xs text-brand-brown sm:text-sm">Palmas y plantas ornamentales de interior</span>
          </span>
        </Link>
      </div>
    </header>
  )
}
