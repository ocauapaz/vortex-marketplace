import type { ReactNode } from 'react'

export function LoadingBlock({ label = 'Carregando…' }: { label?: string }) {
  return (
    <p
      role="status"
      className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-muted"
    >
      {label}
    </p>
  )
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5">
      <p className="font-display font-semibold text-red-700">Algo deu errado</p>
      <p className="mt-1 text-sm text-red-700/80">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg border border-red-300 px-4 py-1.5 font-display text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
        >
          Tentar de novo
        </button>
      )}
    </div>
  )
}

export function EmptyBlock({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface p-12 text-center">
      <p className="font-display text-lg font-medium text-muted">{children}</p>
    </div>
  )
}
