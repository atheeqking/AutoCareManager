import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { NoAccessPage } from '../pages/NoAccessPage'
import type { Role } from '../types/auth'

export function ProtectedRoute({ roles }: { roles: Role[] }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated || !user) {
    return (
      <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
    )
  }
  return roles.includes(user.role) ? <Outlet /> : <NoAccessPage />
}
