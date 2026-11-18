import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { customerService } from '../services/customerService'
import type { Customer, Vehicle } from '../types/domain'
import { useAuth } from '../context/AuthContext'
import { PhoneInput } from '../components/PhoneInput'
import { apiErrorMessage } from '../utils/apiError'
import { PageLayout } from '../components/PageLayout'

const emptyVehicle = { make: '', model: '', color: '', licensePlate: '', year: '' }
const currentYear = new Date().getFullYear()

export function CustomerPortalPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [addingVehicle, setAddingVehicle] = useState(searchParams.get('addVehicle') === '1')
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle)
  const [vehicleError, setVehicleError] = useState('')
  const [vehicleSaved, setVehicleSaved] = useState('')
  const [savingVehicle, setSavingVehicle] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [form, setForm] = useState({ name: '', phone: '', email: user?.email ?? '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [missingProfile, setMissingProfile] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  async function load() {
    setLoading(true)
    setError('')
    let profile: Customer
    try {
      profile = (await customerService.mine()).data
      setCustomer(profile)
      setMissingProfile(false)
      setForm({ name: profile.name, phone: profile.phone, email: profile.email ?? '' })
    } catch (e) {
      if ((e as { response?: { status?: number } }).response?.status === 404) {
        setMissingProfile(true)
        setEditing(true)
      } else setError('Unable to load your profile. Please try again.')
      setLoading(false)
      return
    }
    try {
      setVehicles((await customerService.vehicles(profile.customerId)).data)
    } catch {
      setError('Your profile loaded, but vehicles could not be loaded. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
  }, [])
  async function save(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSaved(false)
    if (saving) return
    if (!form.name.trim() || !/^[0-9]{10}$/.test(form.phone)) {
      setError('Enter your name and a 10-digit phone number.')
      return
    }
    setSaving(true)
    try {
      const input = { ...form, name: form.name.trim(), email: form.email.trim() }
      const result = customer
        ? await customerService.update(customer.customerId, input)
        : await customerService.create(input)
      setCustomer(result.data)
      setMissingProfile(false)
      setEditing(false)
      setSaved(true)
    } catch (e) {
      setError(
        (e as { response?: { data?: { message?: string } } }).response?.data?.message ??
          'Unable to save your profile.',
      )
    } finally {
      setSaving(false)
    }
  }
  async function saveVehicle(event: FormEvent) {
    event.preventDefault()
    if (!customer || savingVehicle) return
    setVehicleError('')
    setVehicleSaved('')
    const input = {
      make: vehicleForm.make.trim(),
      model: vehicleForm.model.trim(),
      color: vehicleForm.color.trim(),
      licensePlate: vehicleForm.licensePlate.trim().toUpperCase(),
    }
    if (!input.make || !input.model || !input.color || !input.licensePlate) {
      setVehicleError('Enter the make, model, colour, and license plate.')
      return
    }
    const year = vehicleForm.year ? Number(vehicleForm.year) : undefined
    if (year !== undefined && (!Number.isInteger(year) || year < 1886 || year > currentYear + 1)) {
      setVehicleError(`Enter a year between 1886 and ${currentYear + 1}, or leave it blank.`)
      return
    }
    setSavingVehicle(true)
    try {
      await customerService.createVehicle(customer.customerId, { ...input, year })
      setVehicles((await customerService.vehicles(customer.customerId)).data)
      setVehicleForm(emptyVehicle)
      setAddingVehicle(false)
      setVehicleSaved(`${input.make} ${input.model} (${input.licensePlate}) has been added.`)
    } catch (e) {
      setVehicleError(apiErrorMessage(e, 'Unable to add this vehicle. Please try again.'))
    } finally {
      setSavingVehicle(false)
    }
  }
  return (
    <PageLayout eyebrow="My AutoCare" title="My AutoCare Profile">
      <section className="rounded-xl bg-white p-6">
        {loading ? (
          <p role="status">Loading your profile…</p>
        ) : (
          <>
            {error && (
              <div role="alert" className="mb-4 text-rose-700">
                <p>{error}</p>
                <button className="mt-2 underline" onClick={() => void load()}>
                  Retry loading
                </button>
              </div>
            )}
            {saved && (
              <p role="status" className="mb-4 text-emerald-800">
                Your details have been saved.
              </p>
            )}
            {editing && (customer || missingProfile) ? (
              <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
                <h2 className="text-xl font-semibold sm:col-span-2">
                  {customer ? 'Edit my details' : 'Complete your profile'}
                </h2>
                {missingProfile && (
                  <p className="text-slate-600 sm:col-span-2">
                    Add your contact details once to start using your existing account.
                  </p>
                )}
                <label className="block text-sm">
                  Full name
                  <input
                    required
                    maxLength={150}
                    autoComplete="name"
                    className="mt-1 w-full"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>
                <PhoneInput value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
                <label className="block text-sm">
                  Email
                  <input
                    type="email"
                    maxLength={254}
                    autoComplete="email"
                    className="mt-1 w-full"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </label>
                <div className="flex items-end gap-3">
                  <button disabled={saving} className="rounded bg-blue-700 px-4 py-3 text-white">
                    {saving ? 'Saving…' : 'Save details'}
                  </button>
                  {customer && (
                    <button
                      type="button"
                      disabled={saving}
                      className="rounded border px-4 py-3"
                      onClick={() => {
                        setEditing(false)
                        setForm({
                          name: customer.name,
                          phone: customer.phone,
                          email: customer.email ?? '',
                        })
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              customer && (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold">My details</h2>
                    <button
                      className="rounded border px-4 py-2"
                      onClick={() => {
                        setEditing(true)
                        setSaved(false)
                      }}
                    >
                      Edit details
                    </button>
                  </div>
                  <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm text-slate-500">Full name</dt>
                      <dd className="font-medium">{customer.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-slate-500">Phone number</dt>
                      <dd className="font-medium">{customer.phone}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm text-slate-500">Email</dt>
                      <dd className="break-words font-medium">
                        {customer.email || 'Not provided'}
                      </dd>
                    </div>
                  </dl>
                </>
              )
            )}
            {customer && (
              <>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">My vehicles</h2>
                  {!addingVehicle && (
                    <button
                      className="rounded bg-blue-700 px-4 py-2 text-white"
                      onClick={() => {
                        setAddingVehicle(true)
                        setVehicleSaved('')
                      }}
                    >
                      Add vehicle
                    </button>
                  )}
                </div>
                {vehicleSaved && (
                  <p role="status" className="mt-3 text-emerald-800">
                    {vehicleSaved}{' '}
                    <Link className="underline" to="/customer/appointments">
                      Book an appointment
                    </Link>
                  </p>
                )}
                {addingVehicle && (
                  <form
                    onSubmit={saveVehicle}
                    className="mt-4 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2"
                    aria-labelledby="add-vehicle-heading"
                  >
                    <h3 id="add-vehicle-heading" className="font-semibold sm:col-span-2">
                      Add a vehicle
                    </h3>
                    {(
                      [
                        ['make', 'Make', 80, 'e.g. Hyundai'],
                        ['model', 'Model', 80, 'e.g. i20'],
                        ['color', 'Colour', 50, ''],
                        ['licensePlate', 'License plate', 30, ''],
                      ] as const
                    ).map(([key, label, max, hint]) => (
                      <label key={key} className="block text-sm">
                        {label}
                        <input
                          required
                          maxLength={max}
                          placeholder={hint}
                          disabled={savingVehicle}
                          className="mt-1 w-full"
                          value={vehicleForm[key]}
                          onChange={(e) =>
                            setVehicleForm({ ...vehicleForm, [key]: e.target.value })
                          }
                        />
                      </label>
                    ))}
                    <label className="block text-sm">
                      Year (optional)
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1886}
                        max={currentYear + 1}
                        disabled={savingVehicle}
                        className="mt-1 w-full"
                        value={vehicleForm.year}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                      />
                    </label>
                    {vehicleError && (
                      <p role="alert" className="text-sm text-rose-700 sm:col-span-2">
                        {vehicleError}
                      </p>
                    )}
                    <div className="flex gap-3 sm:col-span-2">
                      <button
                        disabled={savingVehicle}
                        className="rounded bg-blue-700 px-4 py-3 text-white"
                      >
                        {savingVehicle ? 'Saving…' : 'Save vehicle'}
                      </button>
                      <button
                        type="button"
                        disabled={savingVehicle}
                        className="rounded border px-4 py-3"
                        onClick={() => {
                          setAddingVehicle(false)
                          setVehicleForm(emptyVehicle)
                          setVehicleError('')
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                <div className="mt-3 space-y-3">
                  {vehicles.map((v) => (
                    <Link
                      key={v.vehicleId}
                      to={`/vehicles/${v.vehicleId}`}
                      className="block rounded border border-slate-200 bg-slate-50 p-4"
                    >
                      <strong>
                        {v.make} {v.model}
                      </strong>
                      <span className="block text-sm text-slate-500">
                        {v.licensePlate} · {v.color}
                      </span>
                    </Link>
                  ))}
                  {vehicles.length === 0 && !addingVehicle && (
                    <p className="text-slate-500">
                      No vehicles yet. Add your vehicle to book appointments online.
                    </p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </PageLayout>
  )
}
