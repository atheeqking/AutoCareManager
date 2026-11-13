import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WorkshopAppointmentsPage } from './WorkshopAppointmentsPage'
import { appointmentService } from '../services/appointmentService'
import { customerService } from '../services/customerService'

vi.mock('../services/appointmentService', () => ({ appointmentService: { list: vi.fn(), walkIn: vi.fn() } }))
vi.mock('../services/customerService', () => ({ customerService: { list: vi.fn(), vehicles: vi.fn() } }))
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(appointmentService.list).mockResolvedValue({ data: [] } as any)
  vi.mocked(customerService.list).mockResolvedValue({ data: [{ customerId: 'CUS-1', name: 'Jane', phone: '5551234567' }] } as any)
  vi.mocked(customerService.vehicles).mockResolvedValue({ data: [{ vehicleId: 'VEH-1', make: 'Toyota', model: 'Camry', licensePlate: 'ABC123' }] } as any)
})
async function setup() {
  render(<MemoryRouter><WorkshopAppointmentsPage/></MemoryRouter>)
  await screen.findByRole('option', { name: /Jane/ })
  fireEvent.change(screen.getByLabelText('Customer'), { target: { value: 'CUS-1' } })
  await screen.findByRole('option', { name: /Toyota/ })
  fireEvent.change(screen.getByLabelText('Vehicle'), { target: { value: 'VEH-1' } })
}
describe('workshop walk-in', () => {
  it('requires an issue for specific-issue visits before creating', async () => {
    await setup()
    fireEvent.change(screen.getByLabelText('Service type'), { target: { value: 'SPECIFIC_ISSUE' } })
    fireEvent.change(screen.getByLabelText(/Customer-reported issue/), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Review walk-in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Describe the issue')
    expect(appointmentService.walkIn).not.toHaveBeenCalled()
  })
  it('shows a server failure, allows retry, and displays the created service case', async () => {
    vi.mocked(appointmentService.walkIn).mockRejectedValueOnce({ response: { data: { message: 'Vehicle does not belong to customer' } } }).mockResolvedValueOnce({ data: { serviceCaseId: 'SRV-000001' } } as any)
    await setup()
    fireEvent.click(screen.getByRole('button', { name: 'Review walk-in' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm & Create' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Vehicle does not belong to customer')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm & Create' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Confirm & Create' }))
    expect(await screen.findByRole('status')).toHaveTextContent('SRV-000001')
    expect(appointmentService.walkIn).toHaveBeenLastCalledWith(expect.objectContaining({ customerId: 'CUS-1', vehicleId: 'VEH-1', serviceType: 'GENERAL_MAINTENANCE', priority: 'NORMAL' }))
    expect(screen.queryByRole('button', { name: 'Confirm & Create' })).not.toBeInTheDocument()
  })
})
