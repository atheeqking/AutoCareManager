import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homePath } from '../routes/paths'

export function PageNavigation() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const home = user ? homePath(user.role) : '/login'
  if (location.pathname === '/auth/callback') return null
  function back() {
    if (typeof window.history.state?.idx === 'number' && window.history.state.idx > 0) navigate(-1)
    else navigate(home, { replace: true })
  }
  return (
    <nav aria-label="Page navigation" className="page-navigation">
      <Link to="/" className="brand">
        AutoCare<span>Manager</span>
      </Link>
      <div className="flex items-center gap-4">
        <button type="button" onClick={back} aria-label="Back to previous page">
          ← Back
        </button>
        <Link to="/">Home</Link>
        <Link to={home}>
          {user?.role === 'GUEST' ? 'Book appointment' : user ? 'Dashboard' : 'Login'}
        </Link>
      </div>
    </nav>
  )
}
