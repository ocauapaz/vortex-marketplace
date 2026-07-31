import { useCallback, useEffect, useState } from 'react'

export interface AsyncResult<T> {
  data: T | null
  error: string | null
  /** Primeira carga: ainda não há nada para mostrar. */
  isLoading: boolean
  /** Recarga: os dados anteriores continuam na tela enquanto a nova resposta não chega. */
  isRefreshing: boolean
  reload: () => void
}

/**
 * Busca com abort automático e stale-while-revalidate: trocar de filtro não apaga a
 * lista atual, senão a tela pisca em branco entre uma resposta e outra.
 */
export function useAsync<T>(
  run: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
): AsyncResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setIsPending(true)

    run(controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return
        setData(next)
        setError(null)
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setError(cause instanceof Error ? cause.message : 'Erro inesperado.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsPending(false)
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  const reload = useCallback(() => setAttempt((value) => value + 1), [])

  return {
    data,
    error,
    isLoading: isPending && data === null,
    isRefreshing: isPending && data !== null,
    reload,
  }
}
