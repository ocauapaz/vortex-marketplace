import type { ReactNode } from 'react'

/** Rótulo curto acima do título, no azul institucional da UNIFOR. */
export function Eyebrow({ children, tone = 'brand' }: { children: ReactNode; tone?: 'brand' | 'light' }) {
  return (
    <span
      className={`font-display text-xs font-semibold tracking-[0.22em] uppercase ${
        tone === 'light' ? 'text-cyan' : 'text-brand'
      }`}
    >
      {children}
    </span>
  )
}

/** Palavra destacada dentro de um título, sublinhada pelo traço do laboratório. */
export function Marked({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[0.08em] z-0 h-[0.28em] bg-gradient-to-r from-violet to-cyan"
      />
    </span>
  )
}
