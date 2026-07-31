import { useState } from 'react'
import { Link } from 'react-router'
import { ListingCard } from '../components/ListingCard'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../components/States'
import { Eyebrow } from '../components/Type'
import { useAsync } from '../hooks/useAsync'
import { api, type Listing } from '../lib/api'

export function MyListings() {
  const { data, error, isLoading, isRefreshing, reload } = useAsync(
    (signal) => api.myListings(signal),
    [],
  )
  const [failure, setFailure] = useState<string | null>(null)

  async function handleDelete(listing: Listing) {
    if (!confirm(`Remover "${listing.title}"? Isso não tem volta.`)) return

    try {
      setFailure(null)
      await api.deleteListing(listing.id)
      reload()
    } catch (cause) {
      setFailure(cause instanceof Error ? cause.message : 'Não foi possível remover.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Sua área</Eyebrow>
          <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.4rem)]">Meus anúncios</h1>
        </div>
        <Link
          to="/anunciar"
          className="rounded-lg bg-brand px-5 py-2.5 font-display text-sm font-semibold text-white shadow-brand transition-transform hover:-translate-y-0.5"
        >
          Novo anúncio
        </Link>
      </div>

      {failure && (
        <div className="mt-6">
          <ErrorBlock message={failure} />
        </div>
      )}

      <div className="mt-8">
        {isLoading && <LoadingBlock />}
        {error && !data && <ErrorBlock message={error} onRetry={reload} />}
        {data &&
          (data.data.length === 0 ? (
            <EmptyBlock>
              Você ainda não anunciou nada.{' '}
              <Link to="/anunciar" className="text-brand underline underline-offset-4">
                Comece agora
              </Link>
              .
            </EmptyBlock>
          ) : (
            <div
              className={`grid gap-5 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 ${
                isRefreshing ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {data.data.map((listing, index) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  index={index}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ))}
      </div>
    </div>
  )
}
