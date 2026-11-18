import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { caseService, type Case, type ServiceItem } from '../services/serviceCaseService'
import { apiErrorMessage } from '../utils/apiError'
import { formatDateTime, formatMoney } from '../utils/format'
import { matchesFilter, SERVICE_CASE_STATUS_LABELS } from '../utils/serviceCaseStatus'
import { PageLayout } from '../components/PageLayout'

const labels = SERVICE_CASE_STATUS_LABELS
const money = formatMoney
const emptyItem = { name: '', description: '', quantity: '1', unitPrice: '' }
const message = (e: unknown) => apiErrorMessage(e, 'Unable to save this change. Please try again.')

export function ServiceCasesPage() {
  const { serviceCaseId } = useParams()
  const navigate = useNavigate()
  // The filter lives in the URL so dashboard tiles and the top menu always show the right list.
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = searchParams.get('status') ?? 'ACTIVE'
  const setFilter = (next: string) => setSearchParams({ status: next }, { replace: true })
  const [cases, setCases] = useState<Case[]>([])
  const [selected, setSelected] = useState<Case | null>(null)
  const [items, setItems] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [diagnosis, setDiagnosis] = useState('')
  const [solution, setSolution] = useState('')
  const [item, setItem] = useState(emptyItem)
  const [paymentReceived, setPaymentReceived] = useState(false)
  const [vehicleCollected, setVehicleCollected] = useState(false)
  const [confirmBill, setConfirmBill] = useState(false)
  const lock = useRef(false)
  const generation = useRef(0)
  function display(c: Case) {
    setSelected(c)
    setDiagnosis(c.diagnosis ?? '')
    setSolution(c.solution ?? '')
    setPaymentReceived(false)
    setVehicleCollected(false)
    setConfirmBill(false)
  }
  const load = async () => {
    const request = ++generation.current
    setLoading(true)
    setError('')
    setSelected(null)
    setItems([])
    setNotice('')
    setItem(emptyItem)
    try {
      const all = await caseService.list()
      if (request !== generation.current) return
      setCases(all.data)
      if (serviceCaseId) {
        const [detail, bill] = await Promise.all([
          caseService.get(serviceCaseId),
          caseService.items(serviceCaseId),
        ])
        if (request !== generation.current) return
        display(detail.data)
        setItems(bill.data)
      }
    } catch (e) {
      if (request === generation.current) setError(message(e))
    } finally {
      if (request === generation.current) setLoading(false)
    }
  }
  useEffect(() => {
    void load()
    return () => {
      generation.current++
    }
  }, [serviceCaseId])
  async function run(work: () => Promise<unknown>, success: string) {
    if (!selected || lock.current) return
    lock.current = true
    setBusy(true)
    setError('')
    setNotice('')
    const id = selected.serviceCaseId
    try {
      await work()
      const [detail, bill, all] = await Promise.all([
        caseService.get(id),
        caseService.items(id),
        caseService.list(),
      ])
      display(detail.data)
      if (dirty) {
        setDiagnosis(diagnosis)
        setSolution(solution)
      }
      setItems(bill.data)
      setCases(all.data)
      setNotice(success)
    } catch (e) {
      setError(message(e))
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  const action = (name: string, success: string, body?: object) => {
    if (selected) void run(() => caseService.post(selected.serviceCaseId, name, body), success)
  }
  async function saveDetails(event: FormEvent) {
    event.preventDefault()
    if (!selected) return
    if (!diagnosis.trim() || (selected.status === 'IN_SERVICE' && !solution.trim())) {
      setError('Enter the diagnosis and work performed.')
      return
    }
    await run(async () => {
      await caseService.put(selected.serviceCaseId, 'diagnosis', diagnosis.trim())
      if (selected.status === 'IN_SERVICE')
        await caseService.put(selected.serviceCaseId, 'solution', solution.trim())
    }, 'Service details saved.')
  }
  async function addItem(event: FormEvent) {
    event.preventDefault()
    if (!selected) return
    if (
      !item.name.trim() ||
      !/^\d+$/.test(item.quantity) ||
      Number(item.quantity) < 1 ||
      Number(item.quantity) > 10000 ||
      !/^\d{1,10}(\.\d{1,2})?$/.test(item.unitPrice)
    ) {
      setError(
        'Enter an item name, whole quantity from 1 to 10,000, and a non-negative price with at most two decimal places.',
      )
      return
    }
    await run(async () => {
      await caseService.addItem(selected.serviceCaseId, {
        ...item,
        name: item.name.trim(),
        quantity: Number(item.quantity),
        unitPrice: item.unitPrice,
      })
      setItem(emptyItem)
    }, 'Billing item added.')
  }
  async function pdf() {
    if (!selected || lock.current) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      const result = await caseService.pdf(selected.serviceCaseId)
      const url = URL.createObjectURL(result.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selected.serviceCaseId}.pdf`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 30000)
    } catch {
      setError('Unable to generate the service report and bill.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  const editable = selected?.status === 'IN_SERVICE'
  const total =
    selected?.billingTotal ??
    items.reduce((sum, row) => sum + Math.round(Number(row.lineTotal ?? 0) * 100), 0) / 100
  const dirty =
    !!selected &&
    (diagnosis !== (selected.diagnosis ?? '') || solution !== (selected.solution ?? ''))
  const billReady =
    !!selected?.diagnosis?.trim() &&
    !!selected?.solution?.trim() &&
    items.length > 0 &&
    items.every((row) => row.unitPrice != null) &&
    !dirty
  const visible = cases.filter((c) => matchesFilter(c, filter))
  const buttonClass = 'rounded-lg bg-blue-700 px-4 py-3 text-white disabled:opacity-50'
  return (
    <PageLayout
      width="wide"
      eyebrow="Workshop"
      title="Service cases & billing"
      description="From arrival to service, pickup, and payment."
      actions={
        <Link
          to="/workshop/appointments"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold"
        >
          New walk-in
        </Link>
      }
    >
      <div>
        {error && (
          <div role="alert" className="mt-5 rounded-lg bg-rose-50 p-4 text-rose-700">
            <p>{error}</p>
            <button disabled={busy} onClick={() => void load()} className="mt-2 underline">
              Reload cases
            </button>
          </div>
        )}
        {notice && (
          <p role="status" className="mt-5 rounded-lg bg-emerald-50 p-4 text-emerald-800">
            {notice}
          </p>
        )}
        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[.8fr_1.4fr]">
          <section className="space-y-3">
            <label className="flex items-center gap-3 text-sm font-semibold">
              Show
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="ACTIVE">Active cases</option>
                <option value="HIGH_PRIORITY">High priority (open)</option>
                <option value="TODAY_WALK_INS">Today&apos;s walk-ins</option>
                <option value="CHECKED_IN">Waiting for service</option>
                <option value="IN_SERVICE">Vehicle in service</option>
                <option value="WAITING_FOR_APPROVAL">Waiting for approval</option>
                <option value="READY_FOR_PICKUP">Ready for pickup</option>
                <option value="COMPLETED">Completed</option>
                <option value="ALL">All cases</option>
              </select>
            </label>
            {loading && <p role="status">Loading service cases…</p>}
            {!loading && visible.length === 0 && (
              <p className="rounded-xl bg-white p-5 text-slate-600">
                No cases in this view. Checked-in appointments and walk-ins appear here.
              </p>
            )}
            {visible.map((c) => (
              <button
                key={c.serviceCaseId}
                disabled={busy}
                aria-pressed={selected?.serviceCaseId === c.serviceCaseId}
                className={`block w-full rounded-xl border p-5 text-left ${selected?.serviceCaseId === c.serviceCaseId ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}
                onClick={() =>
                  navigate(`/workshop/service-cases/${c.serviceCaseId}?status=${filter}`)
                }
              >
                <span className="text-sm text-blue-700">{c.serviceCaseId}</span>
                <strong className="mt-1 block text-lg">{c.customerName}</strong>
                <p className="text-sm text-slate-600">
                  {c.vehicle} · {c.licensePlate}
                </p>
                <p className="mt-3 text-sm">{labels[c.status] ?? c.status}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {c.startedByUsername
                    ? `Started by ${c.startedByUsername}`
                    : 'Available for an employee'}{' '}
                  · {c.priority.toLowerCase()} priority
                </p>
              </button>
            ))}
          </section>
          {selected && !loading ? (
            <section className="space-y-5 rounded-xl bg-white p-6">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">{selected.serviceCaseId}</h2>
                    <p className="mt-1">
                      {selected.customerName} · {selected.vehicle}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selected.licensePlate} ·{' '}
                      {selected.visitType === 'WALK_IN' ? 'Walk-in' : 'Appointment'}
                    </p>
                  </div>
                  <button
                    disabled={busy}
                    onClick={() => void pdf()}
                    className="rounded-lg border px-4 py-2"
                  >
                    Download PDF
                  </button>
                </div>
                <p className="mt-4 rounded-lg bg-blue-50 p-3 font-semibold text-blue-700">
                  {labels[selected.status] ?? selected.status}
                </p>
              </div>
              {['CHECKED_IN', 'ON_HOLD'].includes(selected.status) && (
                <div>
                  <p className="mb-3 text-slate-600">
                    Leave this case here if you are busy. Any available employee can start service.
                  </p>
                  <button
                    disabled={busy}
                    onClick={() => action('start-service', 'Vehicle is now in service.')}
                    className={buttonClass}
                  >
                    {selected.status === 'ON_HOLD' ? 'Resume service' : 'Start service'}
                  </button>
                </div>
              )}
              {selected.status === 'WAITING_FOR_APPROVAL' && (
                <button
                  disabled={busy}
                  onClick={() => action('approve', 'Approved. Vehicle is now in service.')}
                  className={buttonClass}
                >
                  Approve & start service
                </button>
              )}
              {editable || selected.status === 'DIAGNOSIS' ? (
                <form onSubmit={saveDetails} className="space-y-3">
                  <h3 className="text-lg font-semibold">Service details</h3>
                  <label className="grid gap-1 text-sm">
                    Diagnosis / inspection findings
                    <textarea
                      required
                      rows={3}
                      maxLength={5000}
                      disabled={busy}
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                    />
                  </label>
                  {editable && (
                    <label className="grid gap-1 text-sm">
                      Work performed
                      <textarea
                        required
                        rows={3}
                        maxLength={5000}
                        disabled={busy}
                        value={solution}
                        onChange={(e) => setSolution(e.target.value)}
                      />
                    </label>
                  )}
                  <button disabled={busy} className="rounded-lg border px-4 py-2">
                    Save service details
                  </button>
                  {dirty && (
                    <p className="text-sm text-slate-500">
                      Save your changes before finalizing the bill.
                    </p>
                  )}
                  {selected.status === 'DIAGNOSIS' && (
                    <button
                      type="button"
                      disabled={busy || dirty || !selected.diagnosis}
                      onClick={() =>
                        action('submit-diagnosis', 'Diagnosis submitted for approval.')
                      }
                      className="ml-3 rounded-lg border px-4 py-2"
                    >
                      Submit diagnosis
                    </button>
                  )}
                </form>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="whitespace-pre-wrap">
                    <strong>Diagnosis:</strong> {selected.diagnosis || 'Not recorded yet'}
                  </p>
                  <p className="whitespace-pre-wrap">
                    <strong>Work performed:</strong> {selected.solution || 'Not recorded yet'}
                  </p>
                </div>
              )}
              <div className="border-t border-slate-200 pt-5">
                <h3 className="text-lg font-semibold">
                  {selected.billedAt ? 'Finalized bill' : 'Billing'} ·{' '}
                  {selected.billingCurrency ?? 'INR'}
                </h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-slate-500">
                        <th className="py-2 pr-3">Item</th>
                        <th className="p-2">Qty</th>
                        <th className="p-2 text-right">Unit price</th>
                        <th className="p-2 text-right">Amount</th>
                        {editable && (
                          <th>
                            <span className="sr-only">Actions</span>
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100">
                          <td className="py-3 pr-3">
                            <strong>{row.name}</strong>
                            {row.description && (
                              <p className="text-xs text-slate-500">{row.description}</p>
                            )}
                          </td>
                          <td className="p-2">{row.quantity}</td>
                          <td className="whitespace-nowrap p-2 text-right">
                            {row.unitPrice == null
                              ? 'Not priced'
                              : money(Number(row.unitPrice), selected.billingCurrency)}
                          </td>
                          <td className="whitespace-nowrap p-2 text-right">
                            {row.lineTotal == null
                              ? 'Not priced'
                              : money(Number(row.lineTotal), selected.billingCurrency)}
                          </td>
                          {editable && (
                            <td>
                              <button
                                disabled={busy}
                                aria-label={`Remove ${row.name}`}
                                className="px-2 text-rose-700"
                                onClick={() =>
                                  void run(
                                    () => caseService.deleteItem(selected.serviceCaseId, row.id),
                                    'Item removed.',
                                  )
                                }
                              >
                                Remove
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {items.length === 0 && (
                  <p className="mt-3 text-sm text-slate-500">
                    No billing items yet. Add parts, labour, and other charges as separate items.
                  </p>
                )}
                <p className="mt-4 text-right text-xl font-bold">
                  Total: {money(Number(total), selected.billingCurrency)}
                </p>
                {editable && (
                  <>
                    <form
                      onSubmit={addItem}
                      className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2"
                    >
                      <label className="grid gap-1 text-sm sm:col-span-2">
                        Item name
                        <input
                          required
                          maxLength={150}
                          disabled={busy}
                          value={item.name}
                          onChange={(e) => setItem({ ...item, name: e.target.value })}
                          placeholder="Engine oil, labour, or another charge"
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        Quantity
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          step="1"
                          required
                          disabled={busy}
                          value={item.quantity}
                          onChange={(e) => setItem({ ...item, quantity: e.target.value })}
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        Unit price (₹)
                        <input
                          type="number"
                          min="0"
                          max="9999999999.99"
                          step="0.01"
                          required
                          disabled={busy}
                          value={item.unitPrice}
                          onChange={(e) => setItem({ ...item, unitPrice: e.target.value })}
                        />
                      </label>
                      <label className="grid gap-1 text-sm sm:col-span-2">
                        Description (optional)
                        <input
                          maxLength={5000}
                          disabled={busy}
                          value={item.description}
                          onChange={(e) => setItem({ ...item, description: e.target.value })}
                        />
                      </label>
                      <button disabled={busy} className="rounded-lg border px-4 py-2 sm:col-span-2">
                        Add billing item
                      </button>
                    </form>
                    {!billReady && (
                      <p className="mt-3 text-sm text-slate-500">
                        Save the service details and add priced billing items before finalizing.
                      </p>
                    )}
                    {!confirmBill ? (
                      <button
                        disabled={busy || !billReady}
                        onClick={() => setConfirmBill(true)}
                        className={`${buttonClass} mt-4`}
                      >
                        Review & finalize bill
                      </button>
                    ) : (
                      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <p>
                          Finalize this bill for <strong>{money(Number(total))}</strong>? Billing
                          items and service details will be locked.
                        </p>
                        <div className="mt-3 flex gap-3">
                          <button
                            disabled={busy || !billReady}
                            onClick={() =>
                              action(
                                'payment-pending',
                                'Bill finalized. You can now mark the vehicle ready for pickup.',
                                { currency: 'INR' },
                              )
                            }
                            className={buttonClass}
                          >
                            Confirm bill
                          </button>
                          <button disabled={busy} onClick={() => setConfirmBill(false)}>
                            Keep editing
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              {selected.status === 'PAYMENT_PENDING' && (
                <div className="border-t pt-5">
                  <p className="mb-3 text-slate-600">
                    The bill is finalized. Mark the vehicle ready when service is finished.
                  </p>
                  <button
                    disabled={busy}
                    onClick={() =>
                      action(
                        'ready-for-pickup',
                        'Vehicle marked ready for pickup. Customer notification created.',
                      )
                    }
                    className={buttonClass}
                  >
                    Mark ready for pickup
                  </button>
                </div>
              )}
              {selected.status === 'READY_FOR_PICKUP' && (
                <div className="space-y-3 rounded-xl bg-emerald-50 p-5">
                  <h3 className="text-lg font-semibold">Payment & handover</h3>
                  <p>
                    Amount due: <strong>{money(Number(total), selected.billingCurrency)}</strong>
                  </p>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      disabled={busy}
                      checked={paymentReceived}
                      onChange={(e) => setPaymentReceived(e.target.checked)}
                    />
                    Full payment received
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      disabled={busy}
                      checked={vehicleCollected}
                      onChange={(e) => setVehicleCollected(e.target.checked)}
                    />
                    Customer has collected the vehicle
                  </label>
                  <button
                    disabled={busy || !paymentReceived || !vehicleCollected}
                    onClick={() =>
                      action('complete', 'Payment and handover recorded. Service case completed.', {
                        paymentReceived,
                        vehicleCollected,
                      })
                    }
                    className={buttonClass}
                  >
                    Complete service case
                  </button>
                </div>
              )}
              {selected.status === 'COMPLETED' && (
                <div className="rounded-xl bg-emerald-50 p-5 text-emerald-800">
                  <h3 className="font-semibold">Paid in full · vehicle collected</h3>
                  <p className="mt-1">{formatDateTime(selected.completedAt)}</p>
                  <p className="mt-2 text-sm">
                    Download the PDF for the completed service report and bill.
                  </p>
                </div>
              )}
            </section>
          ) : (
            !loading && (
              <section className="rounded-xl bg-white p-6 text-slate-600">
                Select a case to start service, add billing, or complete a pickup.
              </section>
            )
          )}
        </div>
      </div>
    </PageLayout>
  )
}
