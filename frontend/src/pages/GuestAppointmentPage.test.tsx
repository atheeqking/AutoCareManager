import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import { GuestAppointmentPage } from './GuestAppointmentPage'
import { appointmentService } from '../services/appointmentService'
vi.mock('../services/appointmentService', () => ({ appointmentService: { guest: vi.fn() } }))
beforeEach(() => vi.clearAllMocks())
function setup() {
  render(
    <MemoryRouter>
      <GuestAppointmentPage />
    </MemoryRouter>,
  )
}
function fill() {
  for (const [label, value] of [
    ['Brand', 'Toyota'],
    ['Model', 'Camry'],
    ['License plate', 'TEST123'],
  ])
    fireEvent.change(screen.getByLabelText(label), { target: { value } })
  fireEvent.change(screen.getByLabelText(/Phone number/), { target: { value: '5551234567' } })
  fireEvent.change(screen.getByLabelText('Preferred date'), { target: { value: '2030-05-20' } })
  fireEvent.change(screen.getByLabelText('Preferred time'), { target: { value: '10:30' } })
}
it('books using phone and visit details with vehicle details without asking for an account', async () => {
  vi.mocked(appointmentService.guest).mockResolvedValue({
    data: {
      appointmentId: 'APT-1',
      requestedDate: '2030-05-20',
      requestedTime: '10:30',
      serviceType: 'GENERAL_MAINTENANCE',
    },
  } as any)
  setup()
  fill()
  expect(screen.queryByLabelText(/password|email|username/i)).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Review appointment' }))
  fireEvent.click(screen.getByRole('button', { name: 'Confirm appointment' }))
  expect(await screen.findByRole('status')).toHaveTextContent('APT-1')
  expect(appointmentService.guest).toHaveBeenCalledWith({
    phone: '5551234567',
    brand: 'Toyota',
    model: 'Camry',
    licensePlate: 'TEST123',
    requestedDate: '2030-05-20',
    requestedTime: '10:30',
    serviceType: 'GENERAL_MAINTENANCE',
    issueDescription: '',
  })
})
it('requires issue details for a specific issue', () => {
  setup()
  fill()
  fireEvent.change(screen.getByLabelText('Service'), { target: { value: 'SPECIFIC_ISSUE' } })
  fireEvent.change(screen.getByLabelText(/Issue description/), { target: { value: '   ' } })
  fireEvent.click(screen.getByRole('button', { name: 'Review appointment' }))
  expect(screen.getByRole('alert')).toHaveTextContent('describe the issue')
  expect(appointmentService.guest).not.toHaveBeenCalled()
})
it('keeps the review open with an actionable error when booking fails', async () => {
  vi.mocked(appointmentService.guest).mockRejectedValue({
    response: { data: { message: 'Appointment date and time must be in the future' } },
  })
  setup()
  fill()
  fireEvent.click(screen.getByRole('button', { name: 'Review appointment' }))
  fireEvent.click(screen.getByRole('button', { name: 'Confirm appointment' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('must be in the future')
  expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
})
