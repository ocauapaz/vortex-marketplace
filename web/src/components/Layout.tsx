import { AnimatePresence, motion } from 'motion/react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { useOnline } from '../hooks/useOnline'
import { useAuth } from '../lib/auth'

const NAV = [
  { to: '/', label: 'Início', icon: 'M3 11 12 3l9 8v10H3z' },
  { to: '/explorar', label: 'Explorar', icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
  { to: '/anunciar', label: 'Anunciar', icon: 'M12 4v16M4 12h16' },
  { to: '/meus-anuncios', label: 'Meus', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0' },
]

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="vortex-gradient flex h-9 w-9 items-center justify-center rounded-lg">
        <span className="font-display text-sm font-bold text-white">D</span>
      </span>
      <span className="font-display text-lg leading-none font-bold tracking-tight">
        Desapega
        <span className="text-brand">.</span>
        <span className="block text-[10px] font-semibold tracking-[0.2em] text-muted uppercase">
          Campus UNIFOR
        </span>
      </span>
    </span>
  )
}

export function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const isOnline = useOnline()

  return (
    <div className="flex min-h-svh flex-col bg-canvas">
      {!isOnline && (
        <p
          role="status"
          className="bg-amber-400 px-4 py-2 text-center text-sm font-medium text-amber-950"
        >
          Você está offline — mostrando os anúncios que já tinham sido carregados.
        </p>
      )}
      <div className="bg-night px-4 py-2 text-center text-xs text-white/70 sm:px-6">
        Um projeto do{' '}
        <a
          href="https://vortex.unifor.br"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-cyan underline-offset-4 hover:underline"
        >
          Laboratório Vortex
        </a>{' '}
        · Universidade de Fortaleza
      </div>

      <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" aria-label="Página inicial">
            <Logo />
          </Link>

          <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `rounded-lg px-3.5 py-2 font-display text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand text-white' : 'text-muted hover:bg-canvas hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted sm:inline">
                Olá, <strong className="font-display text-ink">{user.name.split(' ')[0]}</strong>
              </span>
              <button
                type="button"
                onClick={signOut}
                className="rounded-lg border border-line px-3.5 py-2 font-display text-sm font-medium transition-colors hover:border-brand hover:text-brand"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              to="/entrar"
              className="rounded-lg bg-brand px-4 py-2 font-display text-sm font-semibold text-white shadow-brand transition-transform hover:-translate-y-0.5"
            >
              Entrar
            </Link>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 pb-20 md:pb-0"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <footer className="vortex-gradient mt-20 px-4 py-14 text-white sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2">
          <div>
            <p className="font-display text-2xl font-bold">Desapega Campus</p>
            <p className="mt-3 max-w-md text-white/70">
              Um item parado no seu armário é um semestre inteiro resolvido para outro estudante.
            </p>
          </div>
          <div className="sm:justify-self-end sm:text-right">
            <p className="font-display text-xs font-semibold tracking-[0.2em] text-cyan uppercase">
              Processo Seletivo 2026
            </p>
            <p className="mt-3 text-sm text-white/60">
              Laboratório de Inovação Vortex
              <br />
              Universidade de Fortaleza
            </p>
          </div>
        </div>
      </footer>

      {/* Barra inferior só no mobile: é o que dá cara de app depois de instalar o PWA. */}
      <nav
        aria-label="Navegação rápida"
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 font-display text-[10px] font-medium transition-colors ${
                isActive ? 'text-brand' : 'text-muted'
              }`
            }
          >
            <Icon path={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
