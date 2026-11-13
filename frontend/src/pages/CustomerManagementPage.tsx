import { PhoneInput } from '../components/PhoneInput'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { customerService } from '../services/customerService'
import type { Customer, Vehicle } from '../types/domain'
import { useAuth } from '../context/AuthContext'

const emptyCustomer = { name: '', phone: '', email: '' }
const emptyVehicle = {
  make: '',
  model: '',
  year: '',
  color: '',
  licensePlate: '',
  vin: '',
  currentMileage: '',
}
function message(error: unknown) {
  return (
    (error as { response?: { data?: { message?: string } } }).response?.data?.message ??
    'Unable to save changes.'
  )
}
export function CustomerManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selected, setSelected] = useState<Customer | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [search, setSearch] = useState('')
  const [customerForm, setCustomerForm] = useState(emptyCustomer)
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [addingVehicle, setAddingVehicle] = useState(false)
  const { logout } = useAuth()
  const load = async (query = '') => {
    try {
      setCustomers((await customerService.list(query)).data)
    } catch {
      setError('Unable to load customers.')
    }
  }
  useEffect(() => {
    void load()
  }, [])
  const select = async (customer: Customer) => {
    setSelected(customer)
    setCustomerForm({ name: customer.name, phone: customer.phone, email: customer.email ?? '' })
    setEditing(false)
    setAddingVehicle(false)
    try {
      setVehicles((await customerService.vehicles(customer.customerId)).data)
    } catch {
      setError('Unable to load vehicles.')
    }
  }
  const saveCustomer = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!customerForm.name.trim() || !/^[0-9]{10}$/.test(customerForm.phone))
      return setError('Name and a 10-digit phone number are required.')
    try {
      const data = selected
        ? (await customerService.update(selected.customerId, customerForm)).data
        : (await customerService.create(customerForm)).data
      await load(search)
      await select(data)
    } catch (e) {
      setError(message(e))
    }
  }
  const saveVehicle = async (e: FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setError('')
    if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.color || !vehicleForm.licensePlate)
      return setError('Make, model, color, and license plate are required.')
    try {
      await customerService.createVehicle(selected.customerId, {
        ...vehicleForm,
        year: vehicleForm.year ? Number(vehicleForm.year) : undefined,
        currentMileage: vehicleForm.currentMileage ? Number(vehicleForm.currentMileage) : undefined,
      })
      setVehicles((await customerService.vehicles(selected.customerId)).data)
      setVehicleForm(emptyVehicle)
      setAddingVehicle(false)
    } catch (e) {
      setError(message(e))
    }
  }
  return (
    <main className="min-h-screen bg-slate-50 p-5 text-slate-900">
      <header className="mx-auto mb-6 flex max-w-6xl items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">WORKSHOP</p>
          <h1 className="text-3xl font-bold">Customers & Vehicles</h1>
        </div>
        <button onClick={logout} className="rounded bg-slate-100 px-3 py-2">
          Logout
        </button>
      </header>
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[.9fr_1.4fr]">
        <section className="rounded-xl bg-white p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void load(search)
            }}
            className="flex gap-2"
          >
            <input
              aria-label="Search customers"
              className="min-w-0 flex-1 rounded bg-slate-50 p-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, email"
            />
            <button className="rounded bg-blue-700 px-3 font-semibold text-white">Search</button>
          </form>
          <button
            onClick={() => {
              setSelected(null)
              setCustomerForm(emptyCustomer)
              setEditing(true)
              setVehicles([])
            }}
            className="mt-4 w-full rounded border border-blue-300 px-3 py-2 text-blue-700"
          >
            New Customer
          </button>
          <div className="mt-4 space-y-2">
            {customers.map((c) => (
              <button
                key={c.customerId}
                onClick={() => void select(c)}
                className="w-full rounded bg-slate-50 p-3 text-left hover:bg-slate-100"
              >
                <strong>{c.name}</strong>
                <span className="block text-sm text-slate-500">
                  {c.customerId} · {c.phone}
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-xl bg-white p-5">
          {error && (
            <p role="alert" className="mb-4 text-rose-700">
              {error}
            </p>
          )}
          {editing ? (
            <form onSubmit={saveCustomer} className="space-y-3">
              <h2 className="text-xl font-semibold">
                {selected ? 'Edit Customer' : 'New Customer'}
              </h2>
              <Input
                label="Name *"
                value={customerForm.name}
                onChange={(v) => setCustomerForm({ ...customerForm, name: v })}
              />
              <PhoneInput
                value={customerForm.phone}
                onChange={(v) => setCustomerForm({ ...customerForm, phone: v })}
              />
              <Input
                label="Email"
                type="email"
                value={customerForm.email}
                onChange={(v) => setCustomerForm({ ...customerForm, email: v })}
              />
              <button className="rounded bg-blue-700 px-4 py-2 font-semibold text-white">
                Save Customer
              </button>
            </form>
          ) : selected ? (
            <>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-blue-700">{selected.customerId}</p>
                  <h2 className="text-2xl font-bold">{selected.name}</h2>
                  <p className="text-slate-600">
                    {selected.phone} {selected.email && `· ${selected.email}`}
                  </p>
                </div>
                <button onClick={() => setEditing(true)} className="rounded border px-3 py-2">
                  Edit Customer
                </button>
              </div>
              <div className="mt-7 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Vehicles</h3>
                <button
                  onClick={() => setAddingVehicle(!addingVehicle)}
                  className="rounded bg-blue-700 px-3 py-2 font-semibold text-white"
                >
                  Add Vehicle
                </button>
              </div>
              {addingVehicle && (
                <form
                  onSubmit={saveVehicle}
                  className="mt-4 grid gap-3 rounded bg-slate-50 p-4 sm:grid-cols-2"
                >
                  <Input
                    label="Make *"
                    value={vehicleForm.make}
                    onChange={(v) => setVehicleForm({ ...vehicleForm, make: v })}
                  />
                  <Input
                    label="Model *"
                    value={vehicleForm.model}
                    onChange={(v) => setVehicleForm({ ...vehicleForm, model: v })}
                  />
                  <Input
                    label="Year"
                    type="number"
                    value={vehicleForm.year}
                    onChange={(v) => setVehicleForm({ ...vehicleForm, year: v })}
                  />
                  <Input
                    label="Color *"
                    value={vehicleForm.color}
                    onChange={(v) => setVehicleForm({ ...vehicleForm, color: v })}
                  />
                  <Input
                    label="License Plate *"
                    value={vehicleForm.licensePlate}
                    onChange={(v) => setVehicleForm({ ...vehicleForm, licensePlate: v })}
                  />
                  <Input
                    label="VIN"
                    value={vehicleForm.vin}
                    onChange={(v) => setVehicleForm({ ...vehicleForm, vin: v })}
                  />
                  <Input
                    label="Mileage"
                    type="number"
                    value={vehicleForm.currentMileage}
                    onChange={(v) => setVehicleForm({ ...vehicleForm, currentMileage: v })}
                  />
                  <button className="rounded bg-blue-700 px-4 py-2 font-semibold text-white">
                    Save Vehicle
                  </button>
                </form>
              )}
              <div className="mt-4 space-y-3">
                {vehicles.map((v) => (
                  <Link
                    to={`/vehicles/${v.vehicleId}`}
                    key={v.vehicleId}
                    className="block rounded bg-slate-50 p-4 hover:bg-slate-100"
                  >
                    <strong>
                      {v.make} {v.model}
                    </strong>
                    <span className="block text-sm text-slate-500">
                      {v.vehicleId} · {v.color} · {v.licensePlate}
                    </span>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-500">Select a customer or create a new customer.</p>
          )}
        </section>
      </div>
    </main>
  )
}
function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="block text-sm">
      {label}
      <input
        type={type}
        className="mt-1 w-full rounded bg-slate-100 p-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
