interface CategoryChipsProps {
  categories: string[]
  active: string
  onChange: (category: string) => void
}

export function CategoryChips({ categories, active, onChange }: CategoryChipsProps) {
  const options = ['', ...categories]

  return (
    <div role="group" aria-label="Filtrar por categoria" className="flex flex-wrap gap-2">
      {options.map((category) => {
        const isActive = category === active
        return (
          <button
            key={category || 'todas'}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(category)}
            className={`rounded-full border px-4 py-1.5 font-display text-sm font-medium transition-colors ${
              isActive
                ? 'border-brand bg-brand text-white'
                : 'border-line bg-surface text-muted hover:border-brand hover:text-brand'
            }`}
          >
            {category || 'Tudo'}
          </button>
        )
      })}
    </div>
  )
}
