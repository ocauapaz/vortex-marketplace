import type { ReactNode } from 'react'

export const inputClass =
  'w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition-colors focus:border-brand'

interface FieldProps {
  label: string
  hint?: string
  errors?: string[]
  children: ReactNode
}

export function Field({ label, hint, errors, children }: FieldProps) {
  return (
    <label className="block">
      <span className="font-display text-sm font-semibold">{label}</span>
      {hint && <span className="mt-0.5 block text-sm text-muted">{hint}</span>}
      <span className="mt-1.5 block">{children}</span>
      {errors?.length ? (
        <span className="mt-1.5 block text-sm font-medium text-red-600">{errors.join('. ')}</span>
      ) : null}
    </label>
  )
}
