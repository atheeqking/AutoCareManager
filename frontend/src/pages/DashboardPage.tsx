import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLayout } from '../components/PageLayout'
import {
  dashboardService,
  type CustomerDashboard,
  type WorkshopDashboard,
} from '../services/dashboardService'

type Tile<T> = { key: keyof T; label: string; hint: string; to: string; action: string }

/** Ordered as the vehicle moves through the workshop. */
const WORKSHOP_TILES: Tile<WorkshopDashboard>[] = [
  {
    key: 'todayAppointments',
    label: "Today's appointments",
    hint: 'Visits booked for today',
    to: '/workshop/appointments?view=TODAY',
    action: 'View appointments',
  },
  {
    key: 'todayWalkIns',
    label: "Today's walk-ins",
    hint: 'Vehicles checked in without a booking',
    to: '/workshop/service-cases?status=TODAY_WALK_INS',
    action: 'View walk-ins',
  },
  {
    key: 'waitingForService',
    label: 'Waiting for service',
    hint: 'Checked in, not yet started',
    to: '/workshop/service-cases?status=CHECKED_IN',
    action: 'Start service',
  },
  {
    key: 'vehiclesInService',
    label: 'In service',
    hint: 'Work in progress',
    to: '/workshop/service-cases?status=IN_SERVICE',
    action: 'View vehicles in service',
  },
  {
    key: 'waitingForApproval',
    label: 'Waiting for approval',
    hint: 'Diagnosis submitted for approval',
    to: '/workshop/service-cases?status=WAITING_FOR_APPROVAL',
    action: 'Review approvals',
  },
  {
    key: 'readyForPickup',
    label: 'Ready for pickup',
    hint: 'Awaiting payment and handover',
    to: '/workshop/service-cases?status=READY_FOR_PICKUP',
    action: 'View pickups',
  },
  {
    key: 'highPriorityCases',
    label: 'High priority',
    hint: 'Open cases marked high or critical',
    to: '/workshop/service-cases?status=HIGH_PRIORITY',
    action: 'View priority cases',
  },
  {
    key: 'completedCases',
    label: 'Completed',
    hint: 'Paid and collected',
    to: '/workshop/service-cases?status=COMPLETED',
    action: 'View completed',
  },
]

const CUSTOMER_TILES: Tile<CustomerDashboard>[] = [
  {
    key: 'vehicles',
    label: 'My vehicles',
    hint: 'Vehicles on your profile',
    to: '/customer',
    action: 'Manage vehicles',
  },
  {
    key: 'activeServices',
    label: 'Active services',
    hint: 'Vehicles currently with the workshop',
    to: '/customer',
    action: 'View service history',
  },
  {
    key: 'unreadNotifications',
    label: 'Unread notifications',
    hint: 'Updates about your vehicles',
    to: '/customer/notifications',
    action: 'Open notifications',
  },
]

export function DashboardPage() {
  const { user } = useAuth()
  const workshop = user?.role !== 'CUSTOMER'
  const [data, setData] = useState<WorkshopDashboard | CustomerDashboard | null>(null)
  const [error, setError] = useState('')
  const load = () => {
    setError('')
    ;(workshop ? dashboardService.workshop() : dashboardService.customer())
      .then((r) => setData(r.data))
      .catch(() => setError('Unable to load dashboard.'))
  }
  useEffect(load, [workshop])
  const tiles = (workshop ? WORKSHOP_TILES : CUSTOMER_TILES) as Tile<Record<string, number>>[]
  const values = data as Record<string, number> | null

  return (
    <PageLayout
      width="wide"
      eyebrow={workshop ? 'Workshop' : 'My AutoCare'}
      title={workshop ? 'Workshop dashboard' : 'My dashboard'}
      description={
        workshop
          ? 'Today at a glance. Select a tile to open the matching list.'
          : 'Your vehicles, services and updates in one place.'
      }
      actions={
        workshop ? (
          <Link
            to="/workshop/appointments"
            className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white"
          >
            New walk-in
          </Link>
        ) : (
          <Link
            to="/customer/appointments"
            className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white"
          >
            Book an appointment
          </Link>
        )
      }
    >
      {error ? (
        <section role="alert" className="rounded-xl bg-rose-50 p-5 text-rose-700">
          <p>{error}</p>
          <button className="mt-3 rounded border border-rose-300 px-3 py-2" onClick={load}>
            Retry
          </button>
        </section>
      ) : !values ? (
        <p role="status">Loading dashboard…</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile) => (
            <li key={String(tile.key)}>
              <Link
                to={tile.to}
                className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm"
              >
                <span className="text-sm font-semibold text-slate-600">{tile.label}</span>
                <span className="mt-2 text-3xl font-bold">{values[tile.key as string] ?? 0}</span>
                <span className="mt-1 text-sm text-slate-500">{tile.hint}</span>
                <span className="mt-4 text-sm font-semibold text-blue-700">
                  {tile.action} <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageLayout>
  )
}
