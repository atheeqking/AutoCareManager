import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'

export function RegisterPage() {
  const [username, setUsername] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [submitting, setSubmitting] = useState(false)
  const { completeLogin } = useAuth(); const navigate = useNavigate()
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    if (!username.trim() || !email.trim() || password.length < 8) { setError('Enter a username, valid email address, and password of at least 8 characters.'); return }
    setSubmitting(true)
    try { const { data } = await authService.register(username.trim(), email.trim(), password); completeLogin(data); navigate('/customer', { replace: true }) }
    catch (requestError: any) { setError(requestError.response?.data?.message ?? 'Unable to create your account.') }
    finally { setSubmitting(false) }
  }
  return <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100"><section className="mx-auto w-full max-w-md rounded-2xl bg-slate-900 p-7 shadow-2xl"><p className="text-sm font-semibold uppercase tracking-[.16em] text-sky-400">Customer account</p><h1 className="mt-2 text-3xl font-bold">Create your account</h1><p className="mt-3 text-slate-300">Register, then add your contact details and vehicles.</p><form className="mt-6 space-y-4" onSubmit={submit}><label className="block text-sm">Username<input className="mt-1 w-full rounded-md border border-slate-600 bg-slate-800 p-3" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" /></label><label className="block text-sm">Email<input className="mt-1 w-full rounded-md border border-slate-600 bg-slate-800 p-3" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label><label className="block text-sm">Password<input className="mt-1 w-full rounded-md border border-slate-600 bg-slate-800 p-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></label>{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}<button className="w-full rounded-md bg-sky-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50" disabled={submitting}>Create account</button></form><p className="mt-5 text-sm text-slate-300">Already have an account? <Link className="text-sky-400 underline" to="/login">Log in</Link></p></section></main>
}
