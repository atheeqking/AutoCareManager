import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import { ServiceCasesPage } from './ServiceCasesPage'
import { caseService, type Case, type ServiceItem } from '../services/serviceCaseService'

vi.mock('../services/serviceCaseService', () => ({
  caseService: {
    list: vi.fn(),
    get: vi.fn(),
    items: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    addItem: vi.fn(),
    deleteItem: vi.fn(),
    pdf: vi.fn(),
  },
}))
let current: Case
let items: ServiceItem[]
beforeEach(() => {
  vi.clearAllMocks()
  current = {
    serviceCaseId: 'SRV-1',
    customerName: 'Jane',
    vehicle: 'Toyota Camry',
    licensePlate: 'ABC123',
    priority: 'NORMAL',
    status: 'CHECKED_IN',
    visitType: 'WALK_IN',
  }
  items = []
  vi.mocked(caseService.list).mockImplementation(async () => ({ data: [{ ...current }] }) as any)
  vi.mocked(caseService.get).mockImplementation(async () => ({ data: { ...current } }) as any)
  vi.mocked(caseService.items).mockImplementation(async () => ({ data: [...items] }) as any)
  vi.mocked(caseService.put).mockImplementation(async (_id, action, value) => {
    current = { ...current, [action]: value }
    return { data: current } as any
  })
  vi.mocked(caseService.addItem).mockImplementation(async (_id, value: any) => {
    const row = {
      ...value,
      id: 1,
      unitPrice: Number(value.unitPrice),
      lineTotal: value.quantity * Number(value.unitPrice),
    }
    items.push(row)
    return { data: row } as any
  })
  vi.mocked(caseService.post).mockImplementation(async (_id, action) => {
    const statuses: Record<string, string> = {
      'start-service': 'IN_SERVICE',
      'payment-pending': 'PAYMENT_PENDING',
      'ready-for-pickup': 'READY_FOR_PICKUP',
      complete: 'COMPLETED',
    }
    current = { ...current, status: statuses[action] }
    if (action === 'payment-pending')
      current = {
        ...current,
        billingTotal: 900.5,
        billingCurrency: 'INR',
        billedAt: '2026-09-10T12:00:00Z',
      }
    if (action === 'complete')
      current = { ...current, paidAt: '2026-09-10T13:00:00Z', completedAt: '2026-09-10T13:00:00Z' }
    return { data: current } as any
  })
})
function setup() {
  render(
    <MemoryRouter initialEntries={['/workshop/service-cases/SRV-1']}>
      <Routes>
        <Route path="/workshop/service-cases/:serviceCaseId" element={<ServiceCasesPage />} />
      </Routes>
    </MemoryRouter>,
  )
}
it('leaves a walk-in waiting until an employee explicitly starts it', async () => {
  setup()
  expect(await screen.findByRole('button', { name: 'Start service' })).toBeEnabled()
  expect(caseService.post).not.toHaveBeenCalled()
})
it('supports service, INR billing, pickup and confirmed paid handover', async () => {
  setup()
  fireEvent.click(await screen.findByRole('button', { name: 'Start service' }))
  await screen.findByRole('button', { name: 'Save service details' })
  expect(screen.getByRole('button', { name: 'Review & finalize bill' })).toBeDisabled()
  fireEvent.change(screen.getByLabelText('Diagnosis / inspection findings'), {
    target: { value: 'Oil needs replacement' },
  })
  fireEvent.change(screen.getByLabelText('Work performed'), {
    target: { value: 'Changed engine oil' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save service details' }))
  await screen.findByText('Service details saved.')
  fireEvent.change(screen.getByLabelText('Item name'), { target: { value: 'Engine oil' } })
  fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '2' } })
  fireEvent.change(screen.getByLabelText('Unit price (₹)'), { target: { value: '450.25' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add billing item' }))
  await screen.findByText('Billing item added.')
  expect(screen.getByText('Total: ₹900.50')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Review & finalize bill' }))
  fireEvent.click(screen.getByRole('button', { name: 'Confirm bill' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Mark ready for pickup' }))
  const complete = await screen.findByRole('button', { name: 'Complete service case' })
  expect(complete).toBeDisabled()
  fireEvent.click(screen.getByLabelText('Full payment received'))
  expect(complete).toBeDisabled()
  fireEvent.click(screen.getByLabelText('Customer has collected the vehicle'))
  fireEvent.click(complete)
  expect(await screen.findByText('Paid in full · vehicle collected')).toBeInTheDocument()
  expect(caseService.post).toHaveBeenCalledWith('SRV-1', 'payment-pending', { currency: 'INR' })
  expect(caseService.post).toHaveBeenCalledWith('SRV-1', 'complete', {
    paymentReceived: true,
    vehicleCollected: true,
  })
  expect(screen.queryByRole('button', { name: 'Add billing item' })).not.toBeInTheDocument()
})
it('shows a failed start and lets the employee retry', async () => {
  vi.mocked(caseService.post).mockRejectedValueOnce({
    response: { data: { message: 'This case is no longer waiting for service.' } },
  })
  setup()
  fireEvent.click(await screen.findByRole('button', { name: 'Start service' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('no longer waiting')
  await waitFor(() => expect(screen.getByRole('button', { name: 'Start service' })).toBeEnabled())
})
