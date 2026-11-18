import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { PhoneInput } from '../../components/PhoneInput'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { completeLogin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const booking = searchParams.get('next') === 'appointments'
  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (submitting) return
    if (!name.trim()) {
      setError('Enter your full name.')
      return
    }
    if (!/^[A-Za-z0-9._-]{3,100}$/.test(username.trim())) {
      setError(
        'Username must be 3–100 characters: letters, numbers, dots, underscores, or hyphens.',
      )
      return
    }
    if (!email.trim() || !/^[0-9]{10}$/.test(phone) || password.length < 8) {
      setError('Enter your email, 10-digit phone number, and a password of at least 8 characters.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await authService.register(
        username.trim(),
        email.trim(),
        password,
        phone,
        name.trim(),
      )
      completeLogin(data)
      navigate(booking ? '/customer/appointments' : '/customer/dashboard', { replace: true })
    } catch (requestError) {
      setError(
        (requestError as { response?: { data?: { message?: string } } }).response?.data?.message ??
          'Unable to create your account.',
      )
    } finally {
      setSubmitting(false)
    }
  }
  const inputClass = 'mt-1 w-full rounded-md border border-slate-300 bg-white p-3'
  return (
    <main id="main" className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
      <section className="mx-auto w-full max-w-md rounded-2xl bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[.16em] text-blue-700">
          Customer account
        </p>
        <h1 className="mt-2 text-3xl font-bold">Create your account</h1>
        <p className="mt-3 text-slate-600">
          Your profile, appointments, and vehicle care in one place.
        </p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-sm">
            Full name
            <input
              className={inputClass}
              required
              maxLength={150}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>
          <label className="block text-sm">
            Username
            <input
              className={inputClass}
              required
              minLength={3}
              maxLength={100}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <span className="mt-1 block text-xs text-slate-500">Use this username to log in.</span>
          </label>
          <label className="block text-sm">
            Email
            <input
              className={inputClass}
              required
              maxLength={254}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <PhoneInput value={phone} onChange={setPhone} />
          <label className="block text-sm">
            Password
            <input
              className={inputClass}
              required
              minLength={8}
              maxLength={100}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <span className="mt-1 block text-xs text-slate-500">At least 8 characters.</span>
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
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            className="text-blue-700 underline"
            to={booking ? '/login?next=appointments' : '/login'}
          >
            Log in
          </Link>
        </p>
      </section>
    </main>
  )
}
