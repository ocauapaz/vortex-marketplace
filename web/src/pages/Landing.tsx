import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { CategoryChips } from '../components/CategoryChips'
import { ListingCard } from '../components/ListingCard'
import { Reveal } from '../components/Reveal'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../components/States'
import { Eyebrow, Marked } from '../components/Type'
import { useAsync } from '../hooks/useAsync'
import { useCountUp } from '../hooks/useCountUp'
import { api } from '../lib/api'
import { formatCount } from '../lib/format'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    number: '01',
    title: 'Anuncie em um minuto',
    body: 'Título, categoria e preço — ou marque como doação e deixe de graça para quem precisa.',
  },
  {
    number: '02',
    title: 'O campus encontra',
    body: 'A vitrine é pública e filtrável por categoria, então quem procura material da sua área acha.',
  },
  {
    number: '03',
    title: 'Combinem a entrega',
    body: 'Vocês se acertam presencialmente na universidade. Sem taxa e sem intermediário.',
  },
]

function StatCard({ label, value }: { label: string; value: number }) {
  const ref = useCountUp(value)

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
      <dd ref={ref} className="font-display text-4xl font-bold text-brand">
        {formatCount(value)}
      </dd>
      <dt className="mt-1 text-sm text-muted">{label}</dt>
    </div>
  )
}

export function Landing() {
  const [category, setCategory] = useState('')
  const heroRef = useRef<HTMLElement>(null)

  const stats = useAsync((signal) => api.stats(signal), [])
  const showcase = useAsync((signal) => api.listings({ category, per_page: 8 }, signal), [category])

  const categories = stats.data?.available_categories ?? []

  // Parallax do herói: o fundo anda mais devagar que o conteúdo enquanto a página rola.
  // O GSAP só toca em elementos que o Motion não controla — os dois escrevendo
  // opacity/transform inline no mesmo nó se sobrescrevem e o conteúdo some ao voltar.
  useEffect(() => {
    const context = gsap.context(() => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        const scrub = { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.4 }

        gsap.to('[data-hero-bg]', { yPercent: 24, ease: 'none', scrollTrigger: scrub })
        gsap.to('[data-hero-parallax]', { y: -60, ease: 'none', scrollTrigger: scrub })
      })
    }, heroRef)

    return () => context.revert()
  }, [])

  return (
    <>
      <section ref={heroRef} className="vortex-gradient relative overflow-hidden text-white">
        <div aria-hidden="true" data-hero-bg className="dot-grid absolute inset-0 -bottom-24" />

        <div data-hero-parallax className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <Eyebrow tone="light">Economia circular na UNIFOR</Eyebrow>

            <h1 className="mt-5 text-[clamp(2.6rem,6.5vw,4.8rem)] font-bold text-balance">
              O que sobra no seu armário <Marked>resolve</Marked> o semestre de alguém.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-white/75">
              Livros, jalecos, calculadoras, componentes eletrônicos e móveis circulando entre
              estudantes do campus — para doar ou vender, sem taxa e sem intermediário.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/anunciar"
                className="rounded-lg bg-white px-6 py-3 font-display font-semibold text-brand-deep transition-transform hover:-translate-y-0.5"
              >
                Anunciar um item
              </Link>
              <Link
                to="/explorar"
                className="rounded-lg border border-white/40 px-6 py-3 font-display font-semibold text-white transition-colors hover:bg-white/10"
              >
                Ver a vitrine
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section aria-labelledby="numeros" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="numeros" className="sr-only">
          Números da plataforma
        </h2>

        {stats.isLoading && <LoadingBlock label="Carregando os números…" />}
        {stats.error && !stats.data && <ErrorBlock message={stats.error} onRetry={stats.reload} />}
        {stats.data && (
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Anúncios no ar', value: stats.data.listings },
              { label: 'Itens doados', value: stats.data.donations },
              { label: 'Estudantes ativos', value: stats.data.users },
              { label: 'Categorias', value: stats.data.available_categories.length },
            ].map((item, index) => (
              <Reveal key={item.label} delay={index * 0.08}>
                <StatCard label={item.label} value={item.value} />
              </Reveal>
            ))}
          </dl>
        )}
      </section>

      <section aria-labelledby="como-funciona" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <Eyebrow>Como funciona</Eyebrow>
            <h2 id="como-funciona" className="mt-3 max-w-2xl text-[clamp(1.9rem,4vw,2.8rem)]">
              Três passos entre o armário fechado e o item na mão de outro estudante
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.number} delay={index * 0.12}>
                <div className="h-full rounded-2xl bg-canvas p-6">
                  <span className="vortex-gradient inline-flex h-11 w-11 items-center justify-center rounded-xl font-display font-bold text-white">
                    {step.number}
                  </span>
                  <h3 className="mt-4 font-display text-xl">{step.title}</h3>
                  <p className="mt-2 text-muted">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="vitrine" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Vitrine</Eyebrow>
              <h2 id="vitrine" className="mt-3 text-[clamp(1.9rem,4vw,2.8rem)]">
                Últimos anúncios
              </h2>
            </div>
            <Link
              to="/explorar"
              className="font-display font-semibold text-brand underline-offset-4 hover:underline"
            >
              Ver todos →
            </Link>
          </div>
        </Reveal>

        <div className="mt-6">
          <CategoryChips categories={categories} active={category} onChange={setCategory} />
        </div>

        <div className="mt-8">
          {showcase.isLoading && <LoadingBlock />}
          {showcase.error && !showcase.data && (
            <ErrorBlock message={showcase.error} onRetry={showcase.reload} />
          )}
          {showcase.data &&
            (showcase.data.data.length === 0 ? (
              <EmptyBlock>Nada nesta categoria ainda. Que tal ser o primeiro?</EmptyBlock>
            ) : (
              <div
                className={`grid gap-5 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-4 ${
                  showcase.isRefreshing ? 'opacity-50' : 'opacity-100'
                }`}
              >
                {showcase.data.data.map((listing, index) => (
                  <ListingCard key={listing.id} listing={listing} index={index} />
                ))}
              </div>
            ))}
        </div>
      </section>
    </>
  )
}
