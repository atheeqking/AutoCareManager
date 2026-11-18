import { useEffect, useState } from 'react'
import { PageLayout } from '../components/PageLayout'
import { dashboardService, type Notification } from '../services/dashboardService'
import { formatDateTime } from '../utils/format'

export function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = () =>
    dashboardService
      .notifications()
      .then((r) => {
        setItems(r.data)
        setError('')
      })
      .catch(() => setError('Unable to load notifications.'))
      .finally(() => setLoading(false))
  useEffect(() => {
    void load()
  }, [])
  const update = async (request: () => Promise<unknown>) => {
    try {
      await request()
      await load()
    } catch {
      setError('Unable to update notifications. Please try again.')
    }
  }
  const unread = items.filter((n) => !n.read).length

  return (
    <PageLayout
      eyebrow="My AutoCare"
      title="Notifications"
      description={unread ? `${unread} unread` : 'You are all caught up.'}
      actions={
        unread > 0 && (
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold"
            onClick={() => void update(() => dashboardService.readAll())}
          >
            Mark all read
          </button>
        )
      }
    >
      {loading ? (
        <p role="status">Loading notifications…</p>
      ) : error ? (
        <p role="alert" className="rounded-lg bg-rose-50 p-4 text-rose-700">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-xl bg-white p-5 text-slate-600">You have no notifications.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.notificationId}>
              <button
                onClick={() =>
                  !n.read && void update(() => dashboardService.read(n.notificationId))
                }
                aria-label={n.read ? undefined : `${n.title} (unread, mark as read)`}
                className={
                  'block w-full rounded-xl border p-5 text-left ' +
                  (n.read
                    ? 'border-slate-200 bg-white text-slate-600'
                    : 'border-blue-200 bg-blue-50 text-slate-900')
                }
              >
                <strong>{n.title}</strong>
                <p className="mt-1">{n.message}</p>
                <small className="mt-2 block text-slate-500">
                  {formatDateTime(n.createdAt)}
                  {!n.read ? ' · Unread' : ''}
                </small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </PageLayout>
  )
}
