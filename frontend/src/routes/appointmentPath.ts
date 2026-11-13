export function appointmentPath(role?: string) {
 if (!role) return '/login?next=appointments'
 if (role === 'GUEST') return '/guest/appointments'
 if (role === 'CUSTOMER') return '/customer/appointments'
 return '/workshop/appointments'
}
