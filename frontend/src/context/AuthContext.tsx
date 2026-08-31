import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { apiClient } from '../services/apiClient'
import type { AuthUser, LoginResponse } from '../types/auth'

const TOKEN_KEY = 'autocare.accessToken'
const USER_KEY = 'autocare.user'
type AuthContextValue = { user: AuthUser | null; isAuthenticated: boolean; loading: boolean; completeLogin: (response: LoginResponse) => void; logout: () => void }
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function storedUser(): AuthUser | null { try { const raw = localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) as AuthUser : null } catch { return null } }
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(storedUser)
  const [loading] = useState(false)
  const completeLogin = useCallback((response: LoginResponse) => { localStorage.setItem(TOKEN_KEY, response.accessToken); localStorage.setItem(USER_KEY, JSON.stringify(response.user)); setUser(response.user) }, [])
  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setUser(null) }, [])
  const value = useMemo(() => ({ user, isAuthenticated: user !== null, loading, completeLogin, logout }), [user, loading, completeLogin, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within AuthProvider'); return context }
export function getAccessToken() { return localStorage.getItem(TOKEN_KEY) }
export function clearAuthentication() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY) }

apiClient.interceptors.request.use((config) => { const token = getAccessToken(); if (token) config.headers.Authorization = `Bearer ${token}`; return config })
apiClient.interceptors.response.use((response) => response, (error) => { if (error.response?.status === 401) clearAuthentication(); return Promise.reject(error) })
