// app/error.tsx
'use client'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-4xl" aria-hidden="true">🥀</p>
      <h1 className="font-display text-2xl text-brand-dark">Algo salió mal</h1>
      <p className="text-sm text-brand-dark/80">No pudimos cargar esta página. Intenta de nuevo en un momento.</p>
      <button type="button" onClick={reset} className="btn-primary">
        Reintentar
      </button>
    </main>
  )
}
