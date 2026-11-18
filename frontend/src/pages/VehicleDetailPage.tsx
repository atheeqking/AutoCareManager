import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isWorkshopRole, serviceCasePath } from '../routes/paths'
import { customerService } from '../services/customerService'
import type { ServiceHistory, Vehicle } from '../types/domain'
import { serviceCaseStatusLabel } from '../utils/serviceCaseStatus'
import { PageLayout } from '../components/PageLayout'
import { apiErrorStatus } from '../utils/apiError'

const SERVICE_TYPE_LABELS: Record<string, string> = {
  GENERAL_MAINTENANCE: 'General maintenance',
  SPECIFIC_ISSUE: 'Specific issue',
  BOTH: 'Maintenance & specific issue',
}

export function VehicleDetailPage() {
  const { vehicleId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const workshop = isWorkshopRole(user?.role)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [history, setHistory] = useState<ServiceHistory[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!vehicleId) return
    setLoading(true)
    setError('')
    try {
      const [vehicleResult, historyResult] = await Promise.all([
        customerService.vehicle(vehicleId),
        customerService.history(vehicleId),
      ])
      setVehicle(vehicleResult.data)
      setHistory(historyResult.data)
    } catch (e) {
      const status = apiErrorStatus(e)
      setError(
        status === 403 || status === 404
          ? 'This vehicle is not available to your account.'
          : 'Unable to load vehicle details. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
  }, [vehicleId])

  const fallback = workshop ? '/workshop/customers' : '/customer'
  const back = () => (window.history.length > 1 ? navigate(-1) : navigate(fallback))

  if (loading)
    return (
      <PageLayout>
        <p role="status">Loading vehicle…</p>
      </PageLayout>
    )
  if (error)
    return (
      <PageLayout>
        <p role="alert" className="text-rose-700">
          {error}
        </p>
        <button onClick={() => void load()} className="mt-3 rounded border px-3 py-2">
          Retry
        </button>
      </PageLayout>
    )
  return (
    <PageLayout>
      <section className="mx-auto max-w-3xl rounded-xl bg-white p-7">
        <button onClick={back} className="text-sm font-semibold text-blue-700">
          ← Back
        </button>
        <p className="mt-5 text-sm text-blue-700">{vehicle?.vehicleId}</p>
        <h1 className="text-3xl font-bold">
          {vehicle?.make} {vehicle?.model}
        </h1>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-slate-500">License plate</dt>
            <dd className="font-medium">{vehicle?.licensePlate}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Colour</dt>
            <dd className="font-medium">{vehicle?.color}</dd>
          </div>
          {vehicle?.year != null && (
            <div>
              <dt className="text-slate-500">Year</dt>
              <dd className="font-medium">{vehicle.year}</dd>
            </div>
          )}
          {vehicle?.currentMileage != null && (
            <div>
              <dt className="text-slate-500">Mileage</dt>
              <dd className="font-medium">{vehicle.currentMileage.toLocaleString('en-IN')} km</dd>
            </div>
          )}
          {vehicle?.vin && (
            <div className="sm:col-span-2">
              <dt className="text-slate-500">VIN</dt>
              <dd className="break-all font-medium">{vehicle.vin}</dd>
            </div>
          )}
        </dl>
        <h2 className="mt-8 text-2xl font-bold">Service history</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-slate-600">
            No service history yet. Service records will appear here after this vehicle receives
            service.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {history.map((entry) => (
              <Link
                key={entry.serviceCaseId}
                to={serviceCasePath(entry.serviceCaseId, user?.role)}
                className="block rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b>{entry.serviceCaseId}</b>
                  <span className="text-sm text-slate-600">
                    {serviceCaseStatusLabel(entry.status)} ·{' '}
                    {SERVICE_TYPE_LABELS[entry.serviceType] ?? entry.serviceType}
                  </span>
                </div>
                <p className="mt-2 text-sm">
                  <span className="text-slate-500">Issue:</span> {entry.issue ?? 'Not recorded'}
                </p>
                <p className="text-sm">
                  <span className="text-slate-500">Work:</span> {entry.solution ?? 'Not recorded'}
                </p>
                <span className="mt-2 block text-sm font-semibold text-blue-700">
                  Open service record →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageLayout>
  )
}
