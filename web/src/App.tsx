import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import { Layout } from './components/Layout'
import { LoadingBlock } from './components/States'
import { AuthProvider, useAuth } from './lib/auth'
import { Explore } from './pages/Explore'
import { Landing } from './pages/Landing'
import { MyListings } from './pages/MyListings'
import { NewListing } from './pages/NewListing'
import { SignIn } from './pages/SignIn'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isChecking } = useAuth()
  const location = useLocation()

  if (isChecking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <LoadingBlock label="Verificando sua sessão…" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="explorar" element={<Explore />} />
            <Route path="entrar" element={<SignIn />} />
            <Route
              path="anunciar"
              element={
                <RequireAuth>
                  <NewListing />
                </RequireAuth>
              }
            />
            <Route
              path="meus-anuncios"
              element={
                <RequireAuth>
                  <MyListings />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
