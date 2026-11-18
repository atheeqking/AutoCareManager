import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PhoneInput } from '../components/PhoneInput'
import { PageLayout } from '../components/PageLayout'
import { appointmentService, type Appointment } from '../services/appointmentService'

const services: Record<string, string> = {
  GENERAL_MAINTENANCE: 'General maintenance',
  SPECIFIC_ISSUE: 'Specific issue',
  BOTH: 'Maintenance & specific issue',
}
export function GuestAppointmentPage() {
  const [phone, setPhone] = useState('')
  const [form, setForm] = useState({
    brand: '',
    model: '',
    licensePlate: '',
    requestedDate: '',
    requestedTime: '',
    serviceType: 'GENERAL_MAINTENANCE',
    issueDescription: '',
  })
  const [review, setReview] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [booking, setBooking] = useState<Appointment | null>(null)
  const submitting = useRef(false)
  function validate() {
    if (!/^[0-9]{10}$/.test(phone)) return 'Enter a 10-digit phone number.'
    if (!form.brand.trim() || !form.model.trim() || !form.licensePlate.trim())
      return 'Enter the vehicle brand, model, and license plate.'
    if (
      !form.requestedDate ||
      !form.requestedTime ||
      new Date(`${form.requestedDate}T${form.requestedTime}`).getTime() <= Date.now()
    )
      return 'Choose a future appointment date and time.'
    if (form.serviceType !== 'GENERAL_MAINTENANCE' && !form.issueDescription.trim())
      return 'Please describe the issue with your vehicle.'
    return ''
  }
  function submit(event: FormEvent) {
    event.preventDefault()
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
      setBooking(
        (
          await appointmentService.guest({
            ...form,
            phone,
            brand: form.brand.trim(),
            model: form.model.trim(),
            licensePlate: form.licensePlate.trim().toUpperCase(),
            issueDescription: form.issueDescription.trim(),
          })
        ).data,
      )
      setReview(false)
    } catch (e) {
      setError(
        (e as { response?: { data?: { message?: string } } }).response?.data?.message ??
          'Unable to book your appointment. Please try again.',
      )
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }
  const today = new Date()
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return (
    <PageLayout
      eyebrow="Guest appointment"
      title="Book a visit. Skip the signup."
      description="Enter your phone number, basic vehicle details, and preferred visit time. No account needed."
    >
      <div>
        {error && (
          <p role="alert" className="mt-5 rounded-lg bg-rose-50 p-4 text-rose-700">
            {error}
          </p>
        )}
        {booking ? (
          <section className="mt-6 rounded-xl bg-white p-6">
            <div role="status">
              <p className="text-sm font-semibold text-emerald-800">Appointment requested</p>
              <h2 className="mt-2 text-2xl font-bold">Thank you. We have your request.</h2>
              <p className="mt-4">
                Booking reference: <strong>{booking.appointmentId}</strong>
              </p>
              <p className="mt-2">
                {booking.requestedDate.split('-').reverse().join('/')} at{' '}
                {booking.requestedTime.slice(0, 5)}
              </p>
              <p>
                {services[booking.serviceType]} · {phone}
              </p>
              <p className="mt-2">
                {form.brand} {form.model} / {form.licensePlate.toUpperCase()}
              </p>
              <p className="mt-4 text-sm text-slate-600">
                Your appointment is awaiting workshop confirmation. Keep this reference for your
                visit.
              </p>
            </div>
            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white"
            >
              Back to home
            </Link>
          </section>
        ) : (
          <>
            <form onSubmit={submit} className="mt-6 rounded-xl bg-white p-6">
              <fieldset disabled={review || busy} className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <PhoneInput value={phone} onChange={setPhone} />
                </div>
                {(['brand', 'model', 'licensePlate'] as const).map((key) => (
                  <label key={key} className="grid gap-1 text-sm">
                    {key === 'licensePlate' ? 'License plate' : key === 'brand' ? 'Brand' : 'Model'}
                    <input
                      required
                      maxLength={key === 'licensePlate' ? 30 : 80}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    />
                  </label>
                ))}
                <label className="grid gap-1 text-sm">
                  Preferred date
                  <input
                    required
                    type="date"
                    min={minDate}
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
                    {Object.entries(services).map(([value, text]) => (
                      <option key={value} value={value}>
                        {text}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm sm:col-span-2">
                  Issue description{' '}
                  {form.serviceType === 'GENERAL_MAINTENANCE' ? '(optional)' : '(required)'}
                  <textarea
                    rows={3}
                    required={form.serviceType !== 'GENERAL_MAINTENANCE'}
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
            {review && (
              <section className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-6">
                <h2 className="text-xl font-semibold">Review your appointment</h2>
                <p className="mt-3">Phone: {phone}</p>
                <p>
                  {form.brand} {form.model} / {form.licensePlate.toUpperCase()}
                </p>
                <p>
                  {form.requestedDate.split('-').reverse().join('/')} at {form.requestedTime}
                </p>
                <p>{services[form.serviceType]}</p>
                {form.issueDescription && (
                  <p className="mt-2 whitespace-pre-wrap">{form.issueDescription}</p>
                )}
                <div className="mt-5 flex gap-3">
                  <button
                    disabled={busy}
                    onClick={() => setReview(false)}
                    className="rounded-lg border px-5 py-3"
                  >
                    Edit
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => void confirm()}
                    className="rounded-lg bg-blue-700 px-5 py-3 text-white"
                  >
                    {busy ? 'Booking…' : 'Confirm appointment'}
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}
