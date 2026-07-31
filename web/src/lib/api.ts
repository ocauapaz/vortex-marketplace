const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const TOKEN_KEY = 'desapega.token'

export type ListingKind = 'sale' | 'donation'

export interface PublicUser {
  id: number
  name: string
  course: string | null
}

export interface CurrentUser extends PublicUser {
  email: string
}

export interface Listing {
  id: number
  title: string
  description: string
  category: string
  kind: ListingKind
  price_cents: number | null
  image_url: string | null
  created_at: string
  user: PublicUser
}

export interface ListingPage {
  data: Listing[]
  meta: { page: number; per_page: number; total: number }
}

export interface Stats {
  listings: number
  donations: number
  users: number
  categories: Record<string, number>
  available_categories: string[]
}

export interface ListingInput {
  title: string
  description: string
  category: string
  kind: ListingKind
  price_cents: number | null
  image_url: string
}

export interface ListingQuery {
  category?: string
  kind?: ListingKind | ''
  q?: string
  page?: number
  per_page?: number
}

/** Erro da API já traduzido: `details` traz os campos reprovados na validação do Rails. */
export class ApiError extends Error {
  status: number
  details?: Record<string, string[]>

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export const tokenStore = {
  read: () => localStorage.getItem(TOKEN_KEY),
  write: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.read()

  let response: Response
  try {
    response = await fetch(`${BASE_URL}/api/v1${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError('Não foi possível falar com o servidor. Verifique sua conexão.', 0)
  }

  if (response.status === 204) return undefined as T

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(body?.error ?? 'Algo deu errado.', response.status, body?.details)
  }

  return body as T
}

function buildQuery(query: ListingQuery): string {
  const params = new URLSearchParams()
  if (query.category) params.set('category', query.category)
  if (query.kind) params.set('kind', query.kind)
  if (query.q) params.set('q', query.q)
  if (query.page && query.page > 1) params.set('page', String(query.page))
  if (query.per_page) params.set('per_page', String(query.per_page))

  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export const api = {
  signUp: (user: { name: string; email: string; password: string; course: string }, signal?: AbortSignal) =>
    request<{ token: string; user: CurrentUser }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ user }),
      signal,
    }),

  signIn: (credentials: { email: string; password: string }, signal?: AbortSignal) =>
    request<{ token: string; user: CurrentUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      signal,
    }),

  me: (signal?: AbortSignal) => request<{ user: CurrentUser }>('/me', { signal }),

  myListings: (signal?: AbortSignal) => request<{ data: Listing[] }>('/me/listings', { signal }),

  stats: (signal?: AbortSignal) => request<Stats>('/stats', { signal }),

  listings: (query: ListingQuery = {}, signal?: AbortSignal) =>
    request<ListingPage>(`/listings${buildQuery(query)}`, { signal }),

  createListing: (listing: ListingInput, signal?: AbortSignal) =>
    request<{ data: Listing }>('/listings', {
      method: 'POST',
      body: JSON.stringify({ listing }),
      signal,
    }),

  deleteListing: (id: number, signal?: AbortSignal) =>
    request<void>(`/listings/${id}`, { method: 'DELETE', signal }),
}
