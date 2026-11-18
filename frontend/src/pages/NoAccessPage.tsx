import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homePath } from '../routes/paths'

export function NoAccessPage() {
  const { user, logout } = useAuth()
  const guest = user?.role === 'GUEST'
  return (
    <main id="main" className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <section className="mx-auto w-full max-w-md rounded-2xl bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[.16em] text-blue-700">
          Access restricted
        </p>
        <h1 className="mt-2 text-2xl font-bold">This page is not available to your account</h1>
        <p className="mt-3 text-slate-600">
          {guest
            ? 'Guest sessions can only request appointments. Log in with a customer account to see your vehicles, bookings and service history.'
            : `You are signed in as ${user?.username ?? 'a user'} and this area belongs to a different role.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={homePath(user?.role)}
            className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white"
          >
            {guest ? 'Back to booking' : 'Go to my dashboard'}
          </Link>
          <Link
            to="/login"
            onClick={logout}
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold"
          >
            {guest ? 'Log in' : 'Switch account'}
          </Link>
        </div>
      </section>
    </main>
  )
}
