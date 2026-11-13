import { appointmentPath } from '../../routes/appointmentPath'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import type { LoginResponse } from '../../types/auth'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { completeLogin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const booking = searchParams.get('next') === 'appointments'
  const finish = (response: LoginResponse) => {
    completeLogin(response)
    navigate(booking ? appointmentPath(response.user.role) : homePath(response.user.role), {
      replace: true,
    })
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!username.trim()) return setError('Username is required.')
    if (!password) return setError('Password is required.')
    setSubmitting(true)
    setError('')
    try {
      finish((await authService.login(username, password)).data)
    } catch {
      setError('Invalid username or password.')
    } finally {
      setSubmitting(false)
    }
  }
  async function guest() {
    setSubmitting(true)
    setError('')
    try {
      finish((await authService.guest()).data)
    } catch {
      setError('Unable to start a guest session.')
    } finally {
      setSubmitting(false)
    }
  }
  const googleEnabled = import.meta.env.VITE_GOOGLE_LOGIN_ENABLED === 'true'
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <section className="mx-auto w-full max-w-md rounded-2xl bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[.16em] text-blue-700">
          Vehicle service management
        </p>
        <h1 className="mt-2 text-3xl font-bold">AutoCare Manager</h1>
        <h2 className="mt-8 text-xl font-semibold">Account Login</h2>
        <form className="mt-4 space-y-4" onSubmit={submit}>
          <label className="block text-sm">
            Username
            <input
              className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 p-3"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="block text-sm">
            Password
            <input
              className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 p-3"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-rose-700">
              {error}
            </p>
          )}
          <button
            className="w-full rounded-md bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-50"
            disabled={submitting}
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          New customer?{' '}
          <Link
            className="text-blue-700 underline"
            to={booking ? '/register?next=appointments' : '/register'}
          >
            Create an account
          </Link>
        </p>
        <div className="my-7 border-t border-slate-200" />
        <h2 className="text-xl font-semibold">Customer</h2>
        <button
          className="mt-4 w-full rounded-md border border-slate-300 px-4 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!googleEnabled || submitting}
          onClick={() => {
            sessionStorage.setItem('autocare.afterLogin', booking ? 'appointments' : '')
            window.location.assign(
              `${import.meta.env.VITE_BACKEND_ORIGIN ?? 'http://localhost:8080'}/oauth2/authorization/google`,
            )
          }}
        >
          Continue with Google
        </button>
        {!googleEnabled && (
          <p className="mt-2 text-xs text-slate-500">
            Google login needs the backend Google profile and OAuth credentials.
          </p>
        )}
        <button
          className="mt-3 w-full rounded-md bg-slate-100 px-4 py-3 font-medium disabled:opacity-50"
          disabled={submitting}
          onClick={guest}
        >
          Continue as Guest
        </button>
        <p className="mt-2 text-xs text-slate-500">
          Book with your phone number. No account needed.
        </p>
      </section>
    </main>
  )
}
export function homePath(role: string) {
  if (role === 'CUSTOMER') return '/customer/dashboard'
  if (role === 'GUEST') return '/guest/appointments'
  if (role === 'OWNER') return '/workshop/owner'
  if (role === 'MANAGER') return '/workshop/manager'
  return '/workshop/employee'
}
