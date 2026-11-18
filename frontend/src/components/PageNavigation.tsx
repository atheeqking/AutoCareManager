import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homePath, isWorkshopRole } from '../routes/paths'

type NavItem = { to: string; label: string; end?: boolean }

function navItems(role: string | undefined): NavItem[] {
  if (!role) return [{ to: '/', label: 'Home', end: true }]
  if (role === 'GUEST') return [{ to: '/guest/appointments', label: 'Book appointment' }]
  if (role === 'CUSTOMER')
    return [
      { to: '/customer/dashboard', label: 'Dashboard' },
      { to: '/customer', label: 'My profile', end: true },
      { to: '/customer/appointments', label: 'Appointments' },
      { to: '/customer/notifications', label: 'Notifications' },
    ]
  if (isWorkshopRole(role))
    return [
      { to: homePath(role), label: 'Dashboard' },
      { to: '/workshop/customers', label: 'Customers' },
      { to: '/workshop/appointments', label: 'Appointments' },
      { to: '/workshop/service-cases', label: 'Service cases' },
    ]
  return []
}

export function PageNavigation() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const home = user ? homePath(user.role) : '/login'

  // Close the mobile menu whenever the page changes.
  useEffect(() => setOpen(false), [location.pathname])

  // Clear the session only after leaving the protected page. Clearing it first would let the
  // page's route guard redirect to /login before the navigation home happens.
  useEffect(() => {
    if (signingOut && location.pathname === '/') {
      logout()
      setSigningOut(false)
    }
  }, [signingOut, location.pathname, logout])

  if (location.pathname === '/auth/callback') return null

  function back() {
    if (typeof window.history.state?.idx === 'number' && window.history.state.idx > 0) navigate(-1)
    else navigate(home, { replace: true })
  }
  function signOut() {
    setSigningOut(true)
    navigate('/', { replace: true })
  }
  const items = navItems(user?.role)

  return (
    <header className="page-navigation">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="page-navigation-bar">
        <Link to="/" className="brand">
          AutoCare<span>Manager</span>
        </Link>
        <div className="page-navigation-tools">
          <button type="button" onClick={back} aria-label="Back to previous page">
            ← Back
          </button>
          <button
            type="button"
            className="page-navigation-toggle"
            aria-expanded={open}
            aria-controls="primary-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
        <nav
          id="primary-navigation"
          aria-label="Main"
          className={`page-navigation-menu${open ? ' is-open' : ''}`}
        >
          <ul>
            {items.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {user ? (
            <div className="page-navigation-account">
              <span className="page-navigation-user">
                {user.role === 'GUEST' ? 'Guest session' : user.username}
              </span>
              <button type="button" onClick={signOut}>
                {user.role === 'GUEST' ? 'Exit guest' : 'Log out'}
              </button>
            </div>
          ) : (
            <div className="page-navigation-account">
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register" className="page-navigation-cta">
                Create account
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
