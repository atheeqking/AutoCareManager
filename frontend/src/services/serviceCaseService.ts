import { apiClient } from './apiClient'
export type Case = {
  serviceCaseId: string
  customerName: string
  vehicleId?: string
  vehicle: string
  licensePlate: string
  priority: string
  status: string
  visitType?: string
  serviceType?: string
  diagnosis?: string
  solution?: string
  technicianNotes?: string
  startedByUsername?: string
  assignedEmployeeName?: string
  billingTotal?: number
  billingCurrency?: string
  checkInTime?: string
  readyForPickupAt?: string
  billedAt?: string
  paidAt?: string
  completedAt?: string
}
export type ServiceItem = {
  id: number
  name: string
  description?: string
  quantity: number
  unitPrice: number | null
  lineTotal: number | null
}
export const caseService = {
  list: () => apiClient.get<Case[]>('/service-cases'),
  get: (id: string) => apiClient.get<Case>(`/service-cases/${id}`),
  post: (id: string, action: string, body?: object) =>
    apiClient.post<Case>(`/service-cases/${id}/${action}`, body),
  put: (id: string, action: string, value: string) =>
    apiClient.put<Case>(`/service-cases/${id}/${action}`, { value }),
  items: (id: string) => apiClient.get<ServiceItem[]>(`/service-cases/${id}/items`),
  addItem: (id: string, item: object) =>
    apiClient.post<ServiceItem>(`/service-cases/${id}/items`, item),
  deleteItem: (id: string, itemId: number) =>
    apiClient.delete(`/service-cases/${id}/items/${itemId}`),
  pdf: (id: string) =>
    apiClient.get(`/service-cases/${id}/pdf`, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    }),
}
