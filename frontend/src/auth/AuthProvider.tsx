import { AuthContext } from './useAuth'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { apiFetch } from '@/services/api'
import { getCurrentUser, toUser, type ProfileReadResponse } from '@/services/userService'
import { getToken, setToken, SESSION_CHANGED } from '@/services/session'
import type { User } from '@/types'
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const generation = useRef(0)
  const refetch = useCallback(async () => {
    const current = ++generation.current
    setLoading(true); setError(null); setUser(null)
    try {
      if (getToken()) {
        const result = await getCurrentUser()
        if (current === generation.current) setUser(result)
      }
    } catch (e) {
      if (current === generation.current) setError(e instanceof Error ? e.message : 'Unable to restore session.')
    } finally { if (current === generation.current) setLoading(false) }
  }, [])
  const logout = useCallback(() => {
    generation.current++; setToken(null); setUser(null); setError(null); setLoading(false)
  }, [])
  useEffect(() => {
    void refetch()
    const sync = () => { void refetch() }
    window.addEventListener('storage', sync)
    window.addEventListener(SESSION_CHANGED, sync)
    return () => { window.removeEventListener('storage', sync); window.removeEventListener(SESSION_CHANGED, sync) }
  }, [refetch])
  useEffect(() => {
    if (!user) return
    const token = getToken()
    if (!token) return
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      const timeout = window.setTimeout(() => {
        if (getToken() === token) { logout(); window.location.replace('/login') }
      }, Math.max(0, payload.exp * 1000 - Date.now()))
      return () => window.clearTimeout(timeout)
    } catch { logout() }
  }, [user, logout])
  const login = async (email: string, password: string) => {
    const result = await apiFetch<{access_token: string; user: ProfileReadResponse}>('/auth/login', { method: 'POST', body: JSON.stringify({email, password}) })
    generation.current++; setToken(result.access_token); setUser(toUser(result.user)); setError(null); setLoading(false)
  }
  return <AuthContext.Provider value={{ user, loading, error, login, logout, refetch }}>{children}</AuthContext.Provider>
}
