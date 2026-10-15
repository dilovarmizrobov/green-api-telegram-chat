import { createContext, useContext } from 'react'
import type { Credentials } from '../types'

export interface AuthContextValue {
  credentials: Credentials | null
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
