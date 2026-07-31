import { motion } from 'motion/react'
import type { Listing } from '../lib/api'
import { formatDate, formatPrice } from '../lib/format'

interface ListingCardProps {
  listing: Listing
  index?: number
  onDelete?: (listing: Listing) => void
}

export function ListingCard({ listing, index = 0, onDelete }: ListingCardProps) {
  const isDonation = listing.kind === 'donation'

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index, 7) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      {/* Altura fixa em vez de proporção: com aspect-ratio a imagem crescia junto com a
          coluna e chegava a ocupar 74% do card no desktop. */}
      <div className="relative h-40 shrink-0 overflow-hidden bg-canvas sm:h-44">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            loading="lazy"
            width={600}
            height={400}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="vortex-gradient dot-grid h-full w-full" />
        )}

        {isDonation && (
          <span className="absolute top-3 left-3 rounded-full bg-cyan/95 px-3 py-1 font-display text-[11px] font-semibold tracking-wide text-night uppercase">
            Doação
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-muted">
          <span className="truncate font-display font-semibold tracking-wide uppercase">
            {listing.category}
          </span>
          <span className="shrink-0">{formatDate(listing.created_at)}</span>
        </div>

        {/* min-h reserva as duas linhas mesmo quando o texto é curto, senão a grade
            fica com a base serrilhada. */}
        <h3 className="mt-2 line-clamp-2 min-h-[2.75rem] font-display text-base leading-snug sm:min-h-[3.25rem] sm:text-lg">
          {listing.title}
        </h3>

        <p className="mt-1 line-clamp-2 min-h-[2.625rem] text-sm text-muted">
          {listing.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
          <p
            className={`shrink-0 font-display text-lg font-bold sm:text-xl ${
              isDonation ? 'text-cyan-ink' : 'text-brand'
            }`}
          >
            {formatPrice(listing.price_cents)}
          </p>
          {/* Nome e curso em linhas separadas: juntos, o corte caía no meio da palavra
              num card de 260px. O espaço da segunda linha fica reservado mesmo sem curso. */}
          <p className="min-w-0 text-right text-xs text-muted">
            <span className="block truncate font-medium">{listing.user.name}</span>
            <span className="block truncate" title={listing.user.course ?? undefined}>
              {listing.user.course ?? ' '}
            </span>
          </p>
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(listing)}
            className="mt-3 w-full rounded-lg border border-line py-2 font-display text-sm font-medium text-muted transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            Remover anúncio
          </button>
        )}
      </div>
    </motion.article>
  )
}
