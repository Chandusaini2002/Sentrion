import { getToken, setToken, SESSION_CHANGED } from './session'
export const API_ORIGIN = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
export const API_PREFIX = '/api'
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = 'ApiError' }
}
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  let res: Response
  try { res = await fetch(`${API_ORIGIN}${API_PREFIX}${path}`, { ...init, headers }) }
  catch { throw new ApiError('Could not reach the Sentrion API. Please check your connection and try again.', 0) }
  // An old request must not invalidate a newer account's session.
  if (res.status === 401 && !['/auth/login', '/auth/signup'].includes(path) && token === getToken()) {
    setToken(null)
    window.dispatchEvent(new Event(SESSION_CHANGED))
    window.location.replace('/login')
  }
  if (!res.ok) {
    let message = 'Request failed. Please try again.'
    try {
      const body = await res.json()
      if (typeof body.detail === 'string') message = body.detail
      else if (Array.isArray(body.detail)) message = body.detail.map((e: {msg: string}) => e.msg).join(' ')
    } catch { /* Keep safe fallback. */ }
    throw new ApiError(message, res.status)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
export function toQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) if (value != null) search.set(key, String(value))
  return search.size ? `?${search}` : ''
}
export function mockDelay<T>(value: T, ms = 150): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(structuredClone(value)), ms))
}
