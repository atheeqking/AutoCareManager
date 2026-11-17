import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { apiClient } from '../services/apiClient'
import type { AuthUser, LoginResponse } from '../types/auth'

const TOKEN_KEY = 'autocare.accessToken'
const USER_KEY = 'autocare.user'
/** Dispatched on window when the API rejects the stored token (expired or revoked). */
export const UNAUTHORIZED_EVENT = 'autocare:unauthorized'
export const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please log in again.'

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  /** Message explaining why the user was signed out, shown on the login page. */
  sessionNotice: string | null
  clearSessionNotice: () => void
  completeLogin: (response: LoginResponse) => void
  logout: () => void
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function storedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(storedUser)
  const [sessionNotice, setSessionNotice] = useState<string | null>(null)
  const completeLogin = useCallback((response: LoginResponse) => {
    localStorage.setItem(TOKEN_KEY, response.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(response.user))
    setSessionNotice(null)
    setUser(response.user)
  }, [])
  const logout = useCallback(() => {
    clearAuthentication()
    setSessionNotice(null)
    setUser(null)
  }, [])
  const clearSessionNotice = useCallback(() => setSessionNotice(null), [])
  useEffect(() => {
    function expired() {
      setUser(null)
      setSessionNotice(SESSION_EXPIRED_MESSAGE)
    }
    window.addEventListener(UNAUTHORIZED_EVENT, expired)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, expired)
  }, [])
  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      sessionNotice,
      clearSessionNotice,
      completeLogin,
      logout,
    }),
    [user, sessionNotice, clearSessionNotice, completeLogin, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function clearAuthentication() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 while holding a token means the token is no longer valid. A 401 without a token is
    // an ordinary failed login and is handled by the form that sent it.
    if (error.response?.status === 401 && getAccessToken()) {
      clearAuthentication()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  },
)
