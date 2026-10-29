// components/CategoryFilter.tsx
import Link from 'next/link'
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/constants'
import type { Category } from '@/lib/types'

export default function CategoryFilter({ active }: { active?: Category }) {
  const items: { href: string; label: string; isActive: boolean }[] = [
    { href: '/', label: 'Todas', isActive: !active },
    ...CATEGORIES.map((c) => ({
      href: `/?categoria=${c}`,
      label: CATEGORY_LABELS[c],
      isActive: active === c,
    })),
  ]

  return (
    <nav aria-label="Filtrar por categoría">
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.isActive ? 'page' : undefined}
              className={`inline-flex rounded-full px-4 py-2 text-sm font-medium transition focus-ring ${
                item.isActive
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-brand-dark ring-1 ring-brand-wood hover:bg-brand-wood/30'
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
