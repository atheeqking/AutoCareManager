import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BillingTable } from '../components/BillingTable'
import { caseService, type Case, type ServiceItem } from '../services/serviceCaseService'
import { apiErrorMessage, apiErrorStatus } from '../utils/apiError'
import { formatDateTime, formatMoney } from '../utils/format'
import { PageLayout } from '../components/PageLayout'
import { CUSTOMER_STATUS_EXPLANATIONS, serviceCaseStatusLabel } from '../utils/serviceCaseStatus'

const SERVICE_TYPE_LABELS: Record<string, string> = {
  GENERAL_MAINTENANCE: 'General maintenance',
  SPECIFIC_ISSUE: 'Specific issue',
  BOTH: 'Maintenance & specific issue',
}

/** Read-only view of one service case for the customer who owns the vehicle. */
export function CustomerServiceCasePage() {
  const { serviceCaseId } = useParams()
  const [serviceCase, setServiceCase] = useState<Case | null>(null)
  const [items, setItems] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!serviceCaseId) return
    let active = true
    setLoading(true)
    setError('')
    Promise.all([caseService.get(serviceCaseId), caseService.items(serviceCaseId)])
      .then(([detail, bill]) => {
        if (!active) return
        setServiceCase(detail.data)
        setItems(bill.data)
      })
      .catch((e: unknown) => {
        if (!active) return
        setError(
          apiErrorStatus(e) === 404 || apiErrorStatus(e) === 403
            ? 'We could not find this service record on your account.'
            : apiErrorMessage(e, 'Unable to load this service record. Please try again.'),
        )
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [serviceCaseId])

  async function downloadPdf() {
    if (!serviceCase || downloading) return
    setDownloading(true)
    setError('')
    try {
      const result = await caseService.pdf(serviceCase.serviceCaseId)
      const url = URL.createObjectURL(result.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `${serviceCase.serviceCaseId}.pdf`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 30000)
    } catch {
      setError('Unable to download the service report right now.')
    } finally {
      setDownloading(false)
    }
  }

  const total =
    serviceCase?.billingTotal ??
    items.reduce((sum, row) => sum + Math.round(Number(row.lineTotal ?? 0) * 100), 0) / 100
  const backPath = serviceCase?.vehicleId ? `/vehicles/${serviceCase.vehicleId}` : '/customer'

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl">
        <Link to={backPath} className="text-sm font-semibold text-blue-700">
          ← Back to vehicle
        </Link>
        {loading && (
          <p role="status" className="mt-6">
            Loading service record…
          </p>
        )}
        {error && (
          <p role="alert" className="mt-6 rounded-lg bg-rose-50 p-4 text-rose-700">
            {error}
          </p>
        )}
        {serviceCase && !loading && (
          <article className="mt-4 rounded-xl bg-white p-6">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-blue-700">{serviceCase.serviceCaseId}</p>
                <h1 className="text-2xl font-bold">{serviceCase.vehicle}</h1>
                <p className="text-sm text-slate-500">
                  {serviceCase.licensePlate}
                  {serviceCase.serviceType &&
                    ` · ${SERVICE_TYPE_LABELS[serviceCase.serviceType] ?? serviceCase.serviceType}`}
                  {serviceCase.visitType &&
                    ` · ${serviceCase.visitType === 'WALK_IN' ? 'Walk-in' : 'Appointment'}`}
                </p>
              </div>
              <button
                type="button"
                disabled={downloading}
                onClick={() => void downloadPdf()}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold disabled:opacity-50"
              >
                {downloading ? 'Preparing PDF…' : 'Download PDF'}
              </button>
            </header>

            <section className="mt-5 rounded-lg bg-blue-50 p-4" aria-labelledby="status-heading">
              <h2 id="status-heading" className="font-semibold text-blue-800">
                {serviceCaseStatusLabel(serviceCase.status)}
              </h2>
              <p className="mt-1 text-sm text-blue-900">
                {CUSTOMER_STATUS_EXPLANATIONS[serviceCase.status] ?? ''}
              </p>
            </section>

            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
              {serviceCase.checkInTime && (
                <div>
                  <dt className="text-slate-500">Checked in</dt>
                  <dd className="font-medium">{formatDateTime(serviceCase.checkInTime)}</dd>
                </div>
              )}
              {serviceCase.readyForPickupAt && (
                <div>
                  <dt className="text-slate-500">Ready for pickup</dt>
                  <dd className="font-medium">{formatDateTime(serviceCase.readyForPickupAt)}</dd>
                </div>
              )}
              {serviceCase.completedAt && (
                <div>
                  <dt className="text-slate-500">Completed</dt>
                  <dd className="font-medium">{formatDateTime(serviceCase.completedAt)}</dd>
                </div>
              )}
            </dl>

            <section className="mt-6 space-y-3 text-sm" aria-labelledby="work-heading">
              <h2 id="work-heading" className="text-lg font-semibold">
                Service details
              </h2>
              <p className="whitespace-pre-wrap">
                <strong>What we found:</strong> {serviceCase.diagnosis || 'Not recorded yet'}
              </p>
              <p className="whitespace-pre-wrap">
                <strong>Work performed:</strong> {serviceCase.solution || 'Not recorded yet'}
              </p>
            </section>

            <section className="mt-6 border-t border-slate-200 pt-5" aria-labelledby="bill-heading">
              <h2 id="bill-heading" className="text-lg font-semibold">
                {serviceCase.billedAt ? 'Bill' : 'Charges so far'}
              </h2>
              {!serviceCase.billedAt && items.length > 0 && (
                <p className="mt-1 text-sm text-slate-500">
                  Charges may change until the workshop finalizes the bill.
                </p>
              )}
              <BillingTable
                items={items}
                currency={serviceCase.billingCurrency}
                emptyMessage="No charges have been recorded yet."
              />
              {items.length > 0 && (
                <p className="mt-4 text-right text-xl font-bold">
                  Total: {formatMoney(Number(total), serviceCase.billingCurrency)}
                </p>
              )}
              {serviceCase.paidAt && (
                <p className="mt-2 text-right text-sm text-emerald-800">
                  Paid in full on {formatDateTime(serviceCase.paidAt)}
                </p>
              )}
            </section>
          </article>
        )}
      </div>
    </PageLayout>
  )
}
