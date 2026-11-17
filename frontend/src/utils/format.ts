const LOCALE = 'en-IN'

export function formatMoney(value: number, currency = 'INR') {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(value)
}

/** `2026-11-12` → `12 Nov 2026`. Returns the input unchanged if it is not a plain ISO date. */
export function formatDate(isoDate: string | null | undefined) {
  if (!isoDate) return ''
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!match) return isoDate
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' }).format(
    date,
  )
}

/** `14:30:00` → `2:30 pm`. */
export function formatTime(time: string | null | undefined) {
  if (!time) return ''
  const match = /^(\d{2}):(\d{2})/.exec(time)
  if (!match) return time
  const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]))
  return new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit' }).format(date)
}

/** ISO timestamp → `12 Nov 2026, 2:30 pm` in the viewer's timezone. */
export function formatDateTime(isoTimestamp: string | null | undefined) {
  if (!isoTimestamp) return ''
  const date = new Date(isoTimestamp)
  if (Number.isNaN(date.getTime())) return isoTimestamp
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

/** Today's date as `YYYY-MM-DD` in local time, for `<input type="date" min>`. */
export function todayIsoDate() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`
}
