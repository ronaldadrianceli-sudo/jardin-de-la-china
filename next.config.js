// next.config.js  (reemplaza next.config.mjs)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

let supabaseHost = null
try {
  supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null
} catch {
  supabaseHost = null
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'],
    // Las URLs de Storage llevan UUID (nunca cambian): se pueden cachear 30 días.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }]
        : []),
      // Sólo para seed.sql (desarrollo). Quitar junto con el seed en producción.
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
    ],
  },
}

module.exports = nextConfig
