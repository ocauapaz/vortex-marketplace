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
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-canvas">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            loading="lazy"
            width={600}
            height={450}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="vortex-gradient dot-grid h-full w-full" />
        )}

        <span
          className={`absolute top-3 left-3 rounded-full px-3 py-1 font-display text-[11px] font-semibold tracking-wide uppercase backdrop-blur ${
            isDonation ? 'bg-cyan/90 text-night' : 'bg-white/90 text-brand'
          }`}
        >
          {isDonation ? 'Doação' : listing.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-muted">
          <span className="font-display font-semibold tracking-wide uppercase">
            {listing.category}
          </span>
          <span>{formatDate(listing.created_at)}</span>
        </div>

        <h3 className="font-display text-lg leading-snug text-balance">{listing.title}</h3>

        <p className="line-clamp-2 text-sm text-muted">{listing.description}</p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
          <p
            className={`font-display text-xl font-bold ${isDonation ? 'text-cyan-ink' : 'text-brand'}`}
          >
            {formatPrice(listing.price_cents)}
          </p>
          <p className="text-right text-xs text-muted">
            {listing.user.name}
            {listing.user.course && <span className="block">{listing.user.course}</span>}
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
