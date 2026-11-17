export const SERVICE_CASE_STATUS_LABELS: Record<string, string> = {
  CHECKED_IN: 'Checked in · waiting for service',
  DIAGNOSIS: 'Diagnosis',
  WAITING_FOR_APPROVAL: 'Waiting for approval',
  IN_SERVICE: 'Vehicle in service',
  PAYMENT_PENDING: 'Bill finalized',
  READY_FOR_PICKUP: 'Ready for pickup',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  ON_HOLD: 'On hold',
  DELIVERED: 'Delivered',
}

/** Plain-language explanation shown to customers for each status. */
export const CUSTOMER_STATUS_EXPLANATIONS: Record<string, string> = {
  CHECKED_IN: 'Your vehicle has arrived at the workshop and is waiting for a technician.',
  DIAGNOSIS: 'A technician is inspecting your vehicle.',
  WAITING_FOR_APPROVAL: 'The workshop is reviewing the inspection findings.',
  IN_SERVICE: 'Work on your vehicle is in progress.',
  ON_HOLD: 'Work is paused. The workshop will contact you if anything is needed.',
  PAYMENT_PENDING: 'The bill has been finalized and your vehicle is being prepared for pickup.',
  READY_FOR_PICKUP:
    'Your vehicle is ready. Please visit the workshop to settle the bill and collect it.',
  COMPLETED: 'This service is complete and paid in full.',
  DELIVERED: 'This service is complete.',
  CANCELLED: 'This service was cancelled.',
}

export const CLOSED_STATUSES = ['COMPLETED', 'CANCELLED', 'DELIVERED']

export function serviceCaseStatusLabel(status: string) {
  return SERVICE_CASE_STATUS_LABELS[status] ?? status
}

export function isClosedStatus(status: string) {
  return CLOSED_STATUSES.includes(status)
}
