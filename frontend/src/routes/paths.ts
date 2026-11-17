import type { Role } from '../types/auth'

export const WORKSHOP_ROLES: Role[] = ['EMPLOYEE', 'MANAGER', 'OWNER']

export function isWorkshopRole(role?: string | null) {
  return role === 'EMPLOYEE' || role === 'MANAGER' || role === 'OWNER'
}

/** Landing page for a signed-in role. */
export function homePath(role?: string | null) {
  if (role === 'CUSTOMER') return '/customer/dashboard'
  if (role === 'GUEST') return '/guest/appointments'
  if (role === 'OWNER') return '/workshop/owner'
  if (role === 'MANAGER') return '/workshop/manager'
  if (role === 'EMPLOYEE') return '/workshop/employee'
  return '/login'
}

/** Where "Book an appointment" should take a visitor, given their current role. */
export function appointmentPath(role?: string | null) {
  if (!role) return '/login?next=appointments'
  if (role === 'GUEST') return '/guest/appointments'
  if (role === 'CUSTOMER') return '/customer/appointments'
  return '/workshop/appointments'
}

/** Detail page for a service case, depending on who is looking at it. */
export function serviceCasePath(serviceCaseId: string, role?: string | null) {
  return isWorkshopRole(role)
    ? `/workshop/service-cases/${serviceCaseId}`
    : `/customer/service-cases/${serviceCaseId}`
}
