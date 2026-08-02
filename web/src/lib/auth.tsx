import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, tokenStore, type CurrentUser } from './api'

interface AuthValue {
  user: CurrentUser | null
  isChecking: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: { name: string; email: string; password: string; course: string }) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isChecking, setIsChecking] = useState(Boolean(tokenStore.read()))

  // Token no localStorage pode estar expirado; só o servidor sabe.
  useEffect(() => {
    if (!tokenStore.read()) return

    const controller = new AbortController()
    api
      .me(controller.signal)
      .then((response) => setUser(response.user))
      .catch(() => tokenStore.clear())
      .finally(() => {
        if (!controller.signal.aborted) setIsChecking(false)
      })

    return () => controller.abort()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await api.signIn({ email, password })
    tokenStore.write(session.token)
    setUser(session.user)
  }, [])

  const signUp = useCallback(async (input: { name: string; email: string; password: string; course: string }) => {
    const session = await api.signUp(input)
    tokenStore.write(session.token)
    setUser(session.user)
  }, [])

  const signOut = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo<AuthValue>(
    () => ({ user, isChecking, signIn, signUp, signOut }),
    [user, isChecking, signIn, signUp, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthValue {
  const value = use(AuthContext)
  if (!value) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return value
}
