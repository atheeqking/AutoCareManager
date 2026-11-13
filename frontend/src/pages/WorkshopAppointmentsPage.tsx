import { GuestVehicleDetails } from '../components/GuestVehicleDetails'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { appointmentService, type Appointment } from '../services/appointmentService'
import { customerService } from '../services/customerService'
import type { Customer, Vehicle } from '../types/domain'

const emptyForm = {
  customerId: '',
  vehicleId: '',
  serviceType: 'GENERAL_MAINTENANCE',
  priority: 'NORMAL',
  issueDescription: '',
  additionalNotes: '',
}
const serviceLabels: Record<string, string> = {
  GENERAL_MAINTENANCE: 'General maintenance',
  SPECIFIC_ISSUE: 'Specific issue',
  BOTH: 'Maintenance & specific issue',
}
function errorMessage(error: unknown) {
  return (
    (error as { response?: { data?: { message?: string } } }).response?.data?.message ??
    'Unable to complete this request. Please try again.'
  )
}

export function WorkshopAppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [search, setSearch] = useState('')
  const [review, setReview] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const vehicleRequest = useRef(0)
  const submitting = useRef(false)
  const needsIssue = form.serviceType !== 'GENERAL_MAINTENANCE'
  const customer = customers.find((c) => c.customerId === form.customerId)
  const vehicle = vehicles.find((v) => v.vehicleId === form.vehicleId)

  const load = async () => {
    try {
      setItems((await appointmentService.list()).data)
    } catch (e) {
      setError(errorMessage(e))
    }
  }
  const searchCustomers = async (query: string) => {
    try {
      setCustomers((await customerService.list(query)).data)
    } catch (e) {
      setError(errorMessage(e))
    }
  }
  useEffect(() => {
    void load()
    void searchCustomers('')
  }, [])
  const chooseCustomer = async (id: string) => {
    const request = ++vehicleRequest.current
    setForm((f) => ({ ...f, customerId: id, vehicleId: '' }))
    setVehicles([])
    setReview(false)
    setError('')
    setLoadingVehicles(Boolean(id))
    if (!id) return
    try {
      const result = await customerService.vehicles(id)
      if (request === vehicleRequest.current) setVehicles(result.data)
    } catch (e) {
      if (request === vehicleRequest.current) setError(errorMessage(e))
    } finally {
      if (request === vehicleRequest.current) setLoadingVehicles(false)
    }
  }
  const action = async (id: string, actionName: 'confirm' | 'cancel' | 'noShow' | 'checkIn') => {
    if (submitting.current) return
    submitting.current = true
    setBusy(true)
    setError('')
    try {
      await appointmentService[actionName](id)
      await load()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }
  const validate = () => {
    if (!customer || !vehicle) return 'Select a customer and one of their vehicles.'
    if (needsIssue && !form.issueDescription.trim())
      return 'Describe the issue for the selected service type.'
    if (form.issueDescription.length > 5000 || form.additionalNotes.length > 5000)
      return 'Descriptions and notes must be at most 5,000 characters.'
    return ''
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }
    setReview(true)
  }
  const create = async () => {
    if (submitting.current) return
    const problem = validate()
    if (problem) {
      setError(problem)
      setReview(false)
      return
    }
    submitting.current = true
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await appointmentService.walkIn({
        ...form,
        issueDescription: form.issueDescription.trim(),
        additionalNotes: form.additionalNotes.trim(),
      })
      setMessage(`Walk-in created: ${result.data.serviceCaseId}. View it in Service cases.`)
      setReview(false)
      setForm(emptyForm)
      setVehicles([])
      await load()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-700">WORKSHOP</p>
            <h1 className="text-3xl font-bold">Appointments & walk-ins</h1>
            <p className="mt-2 text-slate-600">
              Manage scheduled visits or check in a customer arriving today.
            </p>
          </div>
          <Link className="text-blue-700 underline" to="/workshop/customers">
            Create customer or vehicle
          </Link>
        </header>
        {message && (
          <p role="status" className="mt-4 rounded bg-emerald-50 p-4 text-emerald-800">
            {message}{' '}
            <Link className="underline" to="/workshop/service-cases">
              Service cases
            </Link>
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded bg-rose-50 p-4 text-rose-700">
            {error}
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void searchCustomers(search)
          }}
          className="mt-6 flex gap-2"
        >
          <input
            aria-label="Search customers"
            className="min-w-0 rounded bg-white p-2"
            placeholder="Search customers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={review || busy}
          />
          <button disabled={review || busy} className="rounded border px-4 py-2">
            Search
          </button>
        </form>
        <form onSubmit={submit} className="mt-4 max-w-2xl rounded-xl bg-white p-6">
          <h2 className="text-xl font-semibold">New walk-in</h2>
          <p className="mt-1 text-sm text-slate-600">
            Creates a service case and checks the vehicle in immediately.
          </p>
          <fieldset disabled={review || busy} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Customer
              <select
                required
                value={form.customerId}
                onChange={(e) => void chooseCustomer(e.target.value)}
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.name} — {c.phone}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Vehicle
              <select
                required
                value={form.vehicleId}
                disabled={!form.customerId || loadingVehicles}
                onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
              >
                <option value="">{loadingVehicles ? 'Loading vehicles…' : 'Select vehicle'}</option>
                {vehicles.map((v) => (
                  <option key={v.vehicleId} value={v.vehicleId}>
                    {v.make} {v.model} — {v.licensePlate}
                  </option>
                ))}
              </select>
            </label>
            {form.customerId && !loadingVehicles && vehicles.length === 0 && (
              <p className="text-sm text-slate-600 sm:col-span-2">
                No vehicles available. Add a vehicle under Customers & Vehicles first.
              </p>
            )}
            <label className="grid gap-1 text-sm">
              Service type
              <select
                value={form.serviceType}
                onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
              >
                {Object.entries(serviceLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Priority
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {['CRITICAL', 'HIGH', 'NORMAL', 'LOW'].map((value) => (
                  <option key={value} value={value}>
                    {value.charAt(0) + value.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm sm:col-span-2">
              Customer-reported issue {needsIssue ? '(required)' : '(optional)'}
              <textarea
                required={needsIssue}
                maxLength={5000}
                rows={3}
                value={form.issueDescription}
                onChange={(e) => setForm({ ...form, issueDescription: e.target.value })}
              />
            </label>
            <button
              disabled={loadingVehicles}
              className="rounded bg-blue-700 px-4 py-3 text-white sm:col-span-2"
            >
              Review walk-in
            </button>
          </fieldset>
        </form>
        {review && (
          <section className="mt-4 max-w-2xl rounded-xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-xl font-bold">Review walk-in</h2>
            <p className="mt-3">
              {customer?.name} · {customer?.phone}
            </p>
            <p>
              {vehicle?.make} {vehicle?.model} · {vehicle?.licensePlate}
            </p>
            <p>
              {serviceLabels[form.serviceType]} · {form.priority.toLowerCase()} priority
            </p>
            {form.issueDescription && (
              <p className="mt-2 whitespace-pre-wrap">{form.issueDescription}</p>
            )}
            {form.additionalNotes && (
              <p className="mt-2 whitespace-pre-wrap">Notes: {form.additionalNotes}</p>
            )}
            <button
              disabled={busy}
              onClick={() => setReview(false)}
              className="mr-3 mt-4 rounded border px-4 py-2"
            >
              Edit
            </button>
            <button
              disabled={busy}
              onClick={() => void create()}
              className="mt-4 rounded bg-blue-700 px-4 py-2 text-white"
            >
              {busy ? 'Creating…' : 'Confirm & Create'}
            </button>
          </section>
        )}
        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Scheduled appointments</h2>
          {items.length === 0 && <p className="text-slate-600">No scheduled appointments.</p>}
          {items.map((x) => (
            <article key={x.appointmentId} className="rounded-xl bg-white p-5">
              <b>{x.appointmentId}</b>
              <p>
                {x.customerName} / {x.phone} / {x.vehicle}
                {x.licensePlate ? ` / ${x.licensePlate}` : ''}
              </p>
              <p>
                {x.requestedDate} {x.requestedTime} · {serviceLabels[x.serviceType]} · {x.status}
              </p>
              {!x.vehicleId && (x.status === 'REQUESTED' || x.status === 'CONFIRMED') && (
                <GuestVehicleDetails appointment={x} onSaved={load} />
              )}
              {(x.status === 'REQUESTED' || x.status === 'CONFIRMED') && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {x.status === 'REQUESTED' ? (
                    <button
                      disabled={busy}
                      onClick={() => void action(x.appointmentId, 'confirm')}
                      className="rounded bg-blue-700 px-4 py-2 text-white"
                    >
                      Confirm
                    </button>
                  ) : (
                    <>
                      <button
                        disabled={busy || !x.vehicleId}
                        onClick={() => void action(x.appointmentId, 'checkIn')}
                        className="rounded bg-blue-700 px-4 py-2 text-white"
                      >
                        Check in
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => void action(x.appointmentId, 'noShow')}
                        className="rounded border px-4 py-2"
                      >
                        No show
                      </button>
                    </>
                  )}
                  <button
                    disabled={busy}
                    onClick={() => void action(x.appointmentId, 'cancel')}
                    className="rounded border px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
