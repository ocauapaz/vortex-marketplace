import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Field, inputClass } from '../components/Field'
import { ErrorBlock } from '../components/States'
import { Eyebrow } from '../components/Type'
import { ApiError } from '../lib/api'
import { useAuth } from '../lib/auth'

type Mode = 'signIn' | 'signUp'

export function SignIn() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/meus-anuncios'

  const [mode, setMode] = useState<Mode>('signIn')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [details, setDetails] = useState<Record<string, string[]>>({})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setIsSubmitting(true)
    setMessage(null)
    setDetails({})

    try {
      if (mode === 'signIn') {
        await signIn(String(form.get('email')), String(form.get('password')))
      } else {
        await signUp({
          name: String(form.get('name')),
          email: String(form.get('email')),
          password: String(form.get('password')),
          course: String(form.get('course')),
        })
      }
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro inesperado.')
      if (error instanceof ApiError && error.details) setDetails(error.details)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
      <Eyebrow>Acesso</Eyebrow>
      <h1 className="mt-3 text-[clamp(2rem,5vw,2.8rem)]">
        {mode === 'signIn' ? 'Entrar na sua conta' : 'Criar sua conta'}
      </h1>

      <div className="mt-7 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <div className="flex rounded-lg bg-canvas p-1">
          {(['signIn', 'signUp'] as Mode[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              onClick={() => {
                setMode(option)
                setMessage(null)
                setDetails({})
              }}
              className={`flex-1 rounded-md py-2 font-display text-sm font-medium transition-colors ${
                mode === option ? 'bg-brand text-white' : 'text-muted hover:text-ink'
              }`}
            >
              {option === 'signIn' ? 'Já tenho conta' : 'Sou novo aqui'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {mode === 'signUp' && (
            <>
              <Field label="Nome" errors={details.name}>
                <input name="name" required minLength={2} maxLength={60} className={inputClass} />
              </Field>
              <Field label="Curso" hint="Opcional, mas ajuda quem procura material da sua área.">
                <input name="course" maxLength={60} className={inputClass} />
              </Field>
            </>
          )}

          <Field label="E-mail" errors={details.email}>
            <input name="email" type="email" required autoComplete="email" className={inputClass} />
          </Field>

          <Field
            label="Senha"
            hint={mode === 'signUp' ? 'Mínimo de 8 caracteres.' : undefined}
            errors={details.password}
          >
            <input
              name="password"
              type="password"
              required
              minLength={mode === 'signUp' ? 8 : undefined}
              autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
              className={inputClass}
            />
          </Field>

          {message && <ErrorBlock message={message} />}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand py-3 font-display font-semibold text-white shadow-brand transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-60"
          >
            {isSubmitting ? 'Enviando…' : mode === 'signIn' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  )
}
