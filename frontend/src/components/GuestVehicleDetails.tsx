import { useEffect, useState, type FormEvent } from 'react'
import { appointmentService, type Appointment } from '../services/appointmentService'
import { customerService } from '../services/customerService'
import type { Vehicle } from '../types/domain'

export function GuestVehicleDetails({ appointment, onSaved }: { appointment: Appointment; onSaved: () => Promise<void> }) {
 const [vehicles, setVehicles] = useState<Vehicle[]>([])
 const [vehicleId, setVehicleId] = useState('')
 const [form, setForm] = useState({ make: '', model: '', color: '', licensePlate: '' })
 const [error, setError] = useState('')
 const [busy, setBusy] = useState(false)
 useEffect(() => { let active = true; customerService.vehicles(appointment.customerId).then(r => { if (active) setVehicles(r.data) }).catch(() => { if (active) setError('Unable to load vehicles. Please reload the page.') }); return () => { active = false } }, [appointment.customerId])
 async function save(event: FormEvent) {
  event.preventDefault(); if (busy) return
  setError(''); setBusy(true)
  try {
   let id = vehicleId
   if (!id) {
    if (!form.make.trim() || !form.model.trim() || !form.color.trim() || !form.licensePlate.trim()) { setError('Enter the vehicle make, model, color, and license plate.'); return }
    const created = (await customerService.createVehicle(appointment.customerId, { make: form.make.trim(), model: form.model.trim(), color: form.color.trim(), licensePlate: form.licensePlate.trim() })).data
    id = created.vehicleId; setVehicleId(id); setVehicles(v => [...v, created])
   }
   await appointmentService.assignVehicle(appointment.appointmentId, id)
   await onSaved()
  } catch (e) { setError((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Unable to save vehicle details.') }
  finally { setBusy(false) }
 }
 return <details className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4"><summary className="cursor-pointer font-semibold text-blue-700">Add vehicle details before check-in</summary><form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-2"><p className="text-sm text-slate-600 sm:col-span-2">This guest booked with a phone number. Record their vehicle when they arrive.</p>{vehicles.length > 0 && <label className="grid gap-1 text-sm sm:col-span-2">Vehicle<select disabled={busy} value={vehicleId} onChange={e => setVehicleId(e.target.value)}><option value="">Add a new vehicle</option>{vehicles.map(v => <option key={v.vehicleId} value={v.vehicleId}>{v.make} {v.model} · {v.licensePlate}</option>)}</select></label>}{!vehicleId && <>{(['make', 'model', 'color', 'licensePlate'] as const).map(key => <label key={key} className="grid gap-1 text-sm">{key === 'licensePlate' ? 'License plate' : key.charAt(0).toUpperCase() + key.slice(1)}<input required disabled={busy} maxLength={key === 'licensePlate' ? 30 : key === 'color' ? 50 : 80} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}/></label>)}</>}{error && <p role="alert" className="text-sm text-rose-700 sm:col-span-2">{error}</p>}<button disabled={busy} className="rounded-lg bg-blue-700 px-4 py-2 text-white sm:col-span-2">{busy ? 'Saving…' : 'Save appointment vehicle'}</button></form></details>
}
