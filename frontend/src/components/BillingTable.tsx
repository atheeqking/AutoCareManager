import type { ServiceItem } from '../services/serviceCaseService'
import { formatMoney } from '../utils/format'

type Props = {
  items: ServiceItem[]
  currency?: string
  /** When provided, a Remove action is rendered for each row. */
  onRemove?: (item: ServiceItem) => void
  busy?: boolean
  emptyMessage?: string
}

export function BillingTable({
  items,
  currency = 'INR',
  onRemove,
  busy = false,
  emptyMessage = 'No billing items yet.',
}: Props) {
  if (items.length === 0) return <p className="mt-3 text-sm text-slate-500">{emptyMessage}</p>
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-slate-500">
            <th className="py-2 pr-3 font-medium">Item</th>
            <th className="p-2 font-medium">Qty</th>
            <th className="p-2 text-right font-medium">Unit price</th>
            <th className="p-2 text-right font-medium">Amount</th>
            {onRemove && (
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
                {row.description && <p className="text-xs text-slate-500">{row.description}</p>}
              </td>
              <td className="p-2">{row.quantity}</td>
              <td className="whitespace-nowrap p-2 text-right">
                {row.unitPrice == null
                  ? 'Not priced'
                  : formatMoney(Number(row.unitPrice), currency)}
              </td>
              <td className="whitespace-nowrap p-2 text-right">
                {row.lineTotal == null
                  ? 'Not priced'
                  : formatMoney(Number(row.lineTotal), currency)}
              </td>
              {onRemove && (
                <td>
                  <button
                    type="button"
                    disabled={busy}
                    aria-label={`Remove ${row.name}`}
                    className="px-2 text-rose-700"
                    onClick={() => onRemove(row)}
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
  )
}
