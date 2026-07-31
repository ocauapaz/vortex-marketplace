import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Field, inputClass } from '../components/Field'
import { ListingCard } from '../components/ListingCard'
import { ErrorBlock, LoadingBlock } from '../components/States'
import { Eyebrow } from '../components/Type'
import { useAsync } from '../hooks/useAsync'
import { ApiError, api, type ListingKind } from '../lib/api'
import { useAuth } from '../lib/auth'

export function NewListing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const stats = useAsync((signal) => api.stats(signal), [])

  const [kind, setKind] = useState<ListingKind>('sale')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [price, setPrice] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [details, setDetails] = useState<Record<string, string[]>>({})

  const categories = stats.data?.available_categories ?? []
  const priceCents = kind === 'sale' && price ? Math.round(Number(price) * 100) : null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    setDetails({})

    try {
      await api.createListing({
        title,
        description,
        category,
        kind,
        price_cents: priceCents,
        image_url: imageUrl,
      })
      navigate('/meus-anuncios')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro inesperado.')
      if (error instanceof ApiError && error.details) setDetails(error.details)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Eyebrow>Novo anúncio</Eyebrow>
      <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.4rem)]">O que vai sair do seu armário?</h1>

      {stats.isLoading && (
        <div className="mt-8">
          <LoadingBlock />
        </div>
      )}

      {stats.data && (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8"
          >
            <fieldset>
              <legend className="font-display text-sm font-semibold">Tipo de anúncio</legend>
              <div className="mt-2 flex rounded-lg bg-canvas p-1">
                {(
                  [
                    { value: 'sale', label: 'Vender' },
                    { value: 'donation', label: 'Doar' },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={kind === option.value}
                    onClick={() => setKind(option.value)}
                    className={`flex-1 rounded-md py-2 font-display text-sm font-medium transition-colors ${
                      kind === option.value
                        ? option.value === 'donation'
                          ? 'bg-cyan-ink text-white'
                          : 'bg-brand text-white'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <Field label="Título" errors={details.title}>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                minLength={3}
                maxLength={80}
                className={inputClass}
              />
            </Field>

            <Field
              label="Descrição"
              hint="Estado de conservação, o que acompanha, onde retirar."
              errors={details.description}
            >
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                maxLength={600}
                rows={4}
                className={`${inputClass} resize-y`}
              />
            </Field>

            <Field label="Categoria" errors={details.category}>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
                className={inputClass}
              >
                <option value="">Escolha uma…</option>
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            {kind === 'sale' && (
              <Field label="Preço (R$)" errors={details.price_cents}>
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  className={inputClass}
                />
              </Field>
            )}

            <Field
              label="URL da imagem"
              hint="Cole o link de uma foto já hospedada."
              errors={details.image_url}
            >
              <input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                type="url"
                placeholder="https://…"
                className={inputClass}
              />
            </Field>

            {message && <ErrorBlock message={message} />}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-brand py-3 font-display font-semibold text-white shadow-brand transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-60"
            >
              {isSubmitting ? 'Publicando…' : 'Publicar anúncio'}
            </button>
          </form>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-3 font-display text-sm font-semibold text-muted">
              Prévia de como o anúncio aparece na vitrine
            </p>
            <ListingCard
              listing={{
                id: 0,
                title: title || 'Título do seu item',
                description: description || 'A descrição aparece aqui enquanto você escreve.',
                category: category || 'Categoria',
                kind,
                price_cents: priceCents,
                image_url: imageUrl || null,
                created_at: new Date().toISOString(),
                user: {
                  id: user?.id ?? 0,
                  name: user?.name ?? 'Você',
                  course: user?.course ?? null,
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
