export const SERVICE_TYPE_LABELS: Record<string, string> = {
  GENERAL_MAINTENANCE: 'General maintenance',
  SPECIFIC_ISSUE: 'Specific issue',
  BOTH: 'Maintenance & specific issue',
}

/** Workshop-facing appointment status names. */
export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'Requested',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked in',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-show',
  COMPLETED: 'Completed',
}

/** Customer-facing appointment status names. */
export const CUSTOMER_APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  ...APPOINTMENT_STATUS_LABELS,
  REQUESTED: 'Awaiting confirmation',
  NO_SHOW: 'Missed',
}

/** Appointments the workshop still has to act on (confirm, check in, cancel). */
export const OPEN_APPOINTMENT_STATUSES = ['REQUESTED', 'CONFIRMED']

export function serviceTypeLabel(type: string) {
  return SERVICE_TYPE_LABELS[type] ?? type
}

/** True when an open appointment's requested date and time are already in the past. */
export function isOverdue(a: { status: string; requestedDate: string; requestedTime: string }) {
  if (!OPEN_APPOINTMENT_STATUSES.includes(a.status)) return false
  const when = new Date(`${a.requestedDate}T${a.requestedTime.slice(0, 5)}`).getTime()
  return !Number.isNaN(when) && when < Date.now()
}
