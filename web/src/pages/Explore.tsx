import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CategoryChips } from '../components/CategoryChips'
import { ListingCard } from '../components/ListingCard'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../components/States'
import { inputClass } from '../components/Field'
import { Eyebrow } from '../components/Type'
import { useAsync } from '../hooks/useAsync'
import { api, type ListingKind } from '../lib/api'

const KINDS: { value: ListingKind | ''; label: string }[] = [
  { value: '', label: 'Tudo' },
  { value: 'donation', label: 'Doações' },
  { value: 'sale', label: 'Vendas' },
]

const PER_PAGE = 12

export function Explore() {
  // Filtro mora na URL: dá para compartilhar o link já filtrado e o voltar do navegador funciona.
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? ''
  const kind = (params.get('kind') ?? '') as ListingKind | ''
  const query = params.get('q') ?? ''
  const page = Math.max(Number(params.get('page') ?? 1), 1)

  const [term, setTerm] = useState(query)

  useEffect(() => {
    if (term === query) return
    const timer = setTimeout(() => update({ q: term, page: '1' }), 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term])

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next, { replace: true })
  }

  const stats = useAsync((signal) => api.stats(signal), [])
  const listings = useAsync(
    (signal) => api.listings({ category, kind, q: query, page, per_page: PER_PAGE }, signal),
    [category, kind, query, page],
  )

  const categories = stats.data?.available_categories ?? []
  const meta = listings.data?.meta ?? null
  const lastPage = meta ? Math.max(Math.ceil(meta.total / meta.per_page), 1) : 1

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Eyebrow>Vitrine completa</Eyebrow>
      <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.4rem)]">Explorar anúncios</h1>

      <div className="mt-8 space-y-5 rounded-2xl border border-line bg-surface p-5 shadow-card">
        <div>
          <label htmlFor="busca" className="sr-only">
            Buscar anúncios
          </label>
          <input
            id="busca"
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Buscar por título ou descrição…"
            className={inputClass}
          />
        </div>

        <CategoryChips
          categories={categories}
          active={category}
          onChange={(value) => update({ category: value, page: '1' })}
        />

        <div role="group" aria-label="Filtrar por tipo" className="flex gap-2">
          {KINDS.map((option) => (
            <button
              key={option.value || 'todos'}
              type="button"
              aria-pressed={kind === option.value}
              onClick={() => update({ kind: option.value, page: '1' })}
              className={`rounded-lg border px-4 py-1.5 font-display text-sm font-medium transition-colors ${
                kind === option.value
                  ? 'border-night bg-night text-white'
                  : 'border-line text-muted hover:border-night hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {listings.isLoading && <LoadingBlock />}
        {listings.error && !listings.data && (
          <ErrorBlock message={listings.error} onRetry={listings.reload} />
        )}
        {listings.data &&
          (listings.data.data.length === 0 ? (
            <EmptyBlock>Nenhum anúncio bate com esses filtros.</EmptyBlock>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted">
                {meta?.total} {meta?.total === 1 ? 'resultado' : 'resultados'}
              </p>
              <div
                className={`grid gap-5 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 ${
                  listings.isRefreshing ? 'opacity-50' : 'opacity-100'
                }`}
              >
                {listings.data.data.map((listing, index) => (
                  <ListingCard key={listing.id} listing={listing} index={index} />
                ))}
              </div>
            </>
          ))}
      </div>

      {lastPage > 1 && (
        <nav aria-label="Paginação" className="mt-12 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => update({ page: String(page - 1) })}
            className="rounded-lg border border-line px-4 py-2 font-display text-sm font-medium disabled:opacity-40 enabled:hover:border-brand enabled:hover:text-brand"
          >
            ← Anterior
          </button>
          <span className="font-display text-sm text-muted">
            Página {page} de {lastPage}
          </span>
          <button
            type="button"
            disabled={page >= lastPage}
            onClick={() => update({ page: String(page + 1) })}
            className="rounded-lg border border-line px-4 py-2 font-display text-sm font-medium disabled:opacity-40 enabled:hover:border-brand enabled:hover:text-brand"
          >
            Próxima →
          </button>
        </nav>
      )}
    </div>
  )
}
