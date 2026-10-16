import { createContext, useContext } from 'react'
import type { User } from '@/types'
export interface AuthState {
  user: User | null; loading: boolean; error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void; refetch: () => Promise<void>
}
export const AuthContext = createContext<AuthState | null>(null)
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('AuthProvider is required')
  return context
}
