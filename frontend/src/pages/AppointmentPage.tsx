import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { customerService } from '../services/customerService'
import { appointmentService, type Appointment } from '../services/appointmentService'
import type { Vehicle } from '../types/domain'
import { apiErrorMessage } from '../utils/apiError'
import { formatDate, formatTime, todayIsoDate } from '../utils/format'
import { CUSTOMER_APPOINTMENT_STATUS_LABELS, SERVICE_TYPE_LABELS } from '../utils/appointmentStatus'
import { PageLayout } from '../components/PageLayout'

const SERVICE_LABELS = SERVICE_TYPE_LABELS
const STATUS_LABELS = CUSTOMER_APPOINTMENT_STATUS_LABELS
const emptyForm = {
  vehicleId: '',
  requestedDate: '',
  requestedTime: '',
  serviceType: 'GENERAL_MAINTENANCE',
  issueDescription: '',
}

export function AppointmentPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [items, setItems] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [review, setReview] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [booked, setBooked] = useState<Appointment | null>(null)
  const submitting = useRef(false)
  const needsIssue = form.serviceType !== 'GENERAL_MAINTENANCE'
  const vehicle = vehicles.find((v) => v.vehicleId === form.vehicleId)

  const load = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const profile = (await customerService.mine()).data
      const [vehicleResult, appointmentResult] = await Promise.all([
        customerService.vehicles(profile.customerId),
        appointmentService.list(),
      ])
      setVehicles(vehicleResult.data)
      setItems(appointmentResult.data)
    } catch (e) {
      setLoadError(apiErrorMessage(e, 'Unable to load your vehicles and appointments.'))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
  }, [])

  function validate() {
    if (!vehicle) return 'Select the vehicle you are booking for.'
    if (!form.requestedDate || !form.requestedTime) return 'Choose a preferred date and time.'
    if (new Date(`${form.requestedDate}T${form.requestedTime}`).getTime() <= Date.now())
      return 'Choose a date and time in the future.'
    if (needsIssue && !form.issueDescription.trim())
      return 'Please describe the issue with your vehicle.'
    return ''
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    setBooked(null)
    const problem = validate()
    setError(problem)
    if (!problem) setReview(true)
  }
  async function confirm() {
    if (submitting.current) return
    const problem = validate()
    setError(problem)
    if (problem) {
      setReview(false)
      return
    }
    submitting.current = true
    setBusy(true)
    try {
      const result = await appointmentService.create({
        ...form,
        issueDescription: form.issueDescription.trim(),
      })
      setBooked(result.data)
      setReview(false)
      setForm(emptyForm)
      setItems((await appointmentService.list()).data)
    } catch (e) {
      setError(apiErrorMessage(e, 'Unable to book your appointment. Please try again.'))
      setReview(false)
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  return (
    <PageLayout
      eyebrow="Appointments"
      title="Book a service visit"
      description="Choose your vehicle and a preferred time. The workshop will confirm your visit."
    >
      <div>
        {loading ? (
          <p role="status" className="mt-6">
            Loading your vehicles…
          </p>
        ) : loadError ? (
          <div role="alert" className="mt-6 rounded-lg bg-rose-50 p-4 text-rose-700">
            <p>{loadError}</p>
            <button className="mt-2 underline" onClick={() => void load()}>
              Try again
            </button>
          </div>
        ) : (
          <>
            {booked && (
              <div role="status" className="mt-6 rounded-lg bg-emerald-50 p-4 text-emerald-800">
                <p className="font-semibold">Appointment requested: {booked.appointmentId}</p>
                <p className="mt-1 text-sm">
                  {formatDate(booked.requestedDate)} at {formatTime(booked.requestedTime)}. The
                  workshop will confirm your visit.
                </p>
              </div>
            )}
            {error && (
              <p role="alert" className="mt-6 rounded-lg bg-rose-50 p-4 text-rose-700">
                {error}
              </p>
            )}

            {vehicles.length === 0 ? (
              <section className="mt-6 rounded-xl bg-white p-6">
                <h2 className="text-xl font-semibold">Add your vehicle first</h2>
                <p className="mt-2 text-slate-600">
                  You need at least one vehicle on your profile to book an appointment.
                </p>
                <Link
                  to="/customer?addVehicle=1"
                  className="mt-4 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white"
                >
                  Add a vehicle
                </Link>
              </section>
            ) : (
              <form onSubmit={submit} className="mt-6 rounded-xl bg-white p-6" noValidate>
                <fieldset disabled={review || busy} className="grid gap-5 sm:grid-cols-2">
                  <legend className="sr-only">Appointment details</legend>
                  <label className="grid gap-1 text-sm sm:col-span-2">
                    Vehicle
                    <select
                      required
                      value={form.vehicleId}
                      onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                    >
                      <option value="">Select vehicle</option>
                      {vehicles.map((v) => (
                        <option key={v.vehicleId} value={v.vehicleId}>
                          {v.make} {v.model} — {v.licensePlate}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm">
                    Preferred date
                    <input
                      required
                      type="date"
                      min={todayIsoDate()}
                      value={form.requestedDate}
                      onChange={(e) => setForm({ ...form, requestedDate: e.target.value })}
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    Preferred time
                    <input
                      required
                      type="time"
                      value={form.requestedTime}
                      onChange={(e) => setForm({ ...form, requestedTime: e.target.value })}
                    />
                  </label>
                  <label className="grid gap-1 text-sm sm:col-span-2">
                    Service
                    <select
                      value={form.serviceType}
                      onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                    >
                      {Object.entries(SERVICE_LABELS).map(([value, text]) => (
                        <option key={value} value={value}>
                          {text}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm sm:col-span-2">
                    Issue description {needsIssue ? '(required)' : '(optional)'}
                    <textarea
                      rows={3}
                      required={needsIssue}
                      maxLength={5000}
                      value={form.issueDescription}
                      onChange={(e) => setForm({ ...form, issueDescription: e.target.value })}
                    />
                  </label>
                  <button className="rounded-lg bg-blue-700 px-5 py-3 text-white sm:col-span-2">
                    Review appointment
                  </button>
                </fieldset>
              </form>
            )}

            {review && vehicle && (
              <section
                className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-6"
                aria-labelledby="review-heading"
              >
                <h2 id="review-heading" className="text-xl font-semibold">
                  Review your appointment
                </h2>
                <dl className="mt-3 grid gap-1 text-sm">
                  <div>
                    <dt className="inline font-semibold">Vehicle: </dt>
                    <dd className="inline">
                      {vehicle.make} {vehicle.model} — {vehicle.licensePlate}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">When: </dt>
                    <dd className="inline">
                      {formatDate(form.requestedDate)} at {formatTime(form.requestedTime)}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Service: </dt>
                    <dd className="inline">{SERVICE_LABELS[form.serviceType]}</dd>
                  </div>
                  {form.issueDescription.trim() && (
                    <div>
                      <dt className="inline font-semibold">Issue: </dt>
                      <dd className="inline whitespace-pre-wrap">{form.issueDescription.trim()}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    disabled={busy}
                    onClick={() => setReview(false)}
                    className="rounded-lg border bg-white px-4 py-2"
                  >
                    Edit
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => void confirm()}
                    className="rounded-lg bg-blue-700 px-4 py-2 text-white"
                  >
                    {busy ? 'Booking…' : 'Confirm appointment'}
                  </button>
                </div>
              </section>
            )}

            <section className="mt-10" aria-labelledby="my-appointments-heading">
              <h2 id="my-appointments-heading" className="text-xl font-semibold">
                My appointments
              </h2>
              {items.length === 0 ? (
                <p className="mt-3 text-slate-600">You have no appointments yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {items.map((x) => (
                    <li key={x.appointmentId} className="rounded-xl bg-white p-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <strong>{x.appointmentId}</strong>
                        <span className="text-sm font-semibold text-blue-700">
                          {STATUS_LABELS[x.status] ?? x.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {x.vehicle} · {formatDate(x.requestedDate)} at {formatTime(x.requestedTime)}{' '}
                        · {SERVICE_LABELS[x.serviceType] ?? x.serviceType}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </PageLayout>
  )
}
