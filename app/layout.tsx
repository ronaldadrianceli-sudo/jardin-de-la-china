// app/layout.tsx
import type { Metadata } from 'next'
import { Fredoka, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { getSiteSettings } from '@/lib/data'
import './globals.css'

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const display = Fredoka({ subsets: ['latin'], variable: '--font-display', display: 'swap' })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const title = 'El Jardín de la China | Palmas y plantas de interior'
const description =
  'Vivero especializado en palmas y plantas ornamentales de interior. Mira el catálogo y compra por WhatsApp.'

export async function generateMetadata(): Promise<Metadata> {
  const { logo_url } = await getSiteSettings()
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'es_EC',
      siteName: 'El Jardín de la China',
      images: logo_url ? [{ url: logo_url, alt: 'Logo de El Jardín de la China' }] : undefined,
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
