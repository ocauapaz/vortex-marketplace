interface CategoryChipsProps {
  categories: string[]
  active: string
  onChange: (category: string) => void
}

export function CategoryChips({ categories, active, onChange }: CategoryChipsProps) {
  const options = ['', ...categories]

  return (
    // No mobile as categorias rolam na horizontal: empilhadas em três linhas elas
    // empurravam o primeiro resultado para fora da tela.
    <div
      role="group"
      aria-label="Filtrar por categoria"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
    >
      {options.map((category) => {
        const isActive = category === active
        return (
          <button
            key={category || 'todas'}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(category)}
            className={`shrink-0 rounded-full border px-4 py-1.5 font-display text-sm font-medium transition-colors ${
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
