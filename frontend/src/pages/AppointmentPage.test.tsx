import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import { AppointmentPage } from './AppointmentPage'
import { customerService } from '../services/customerService'
import { appointmentService } from '../services/appointmentService'

vi.mock('../services/customerService', () => ({
  customerService: { mine: vi.fn(), vehicles: vi.fn() },
}))
vi.mock('../services/appointmentService', () => ({
  appointmentService: { list: vi.fn(), create: vi.fn() },
}))

const vehicle = { vehicleId: 'VEH-1', make: 'Hyundai', model: 'i20', licensePlate: 'KA01AB1234' }
const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(customerService.mine).mockResolvedValue({ data: { customerId: 'CUS-1' } } as any)
  vi.mocked(customerService.vehicles).mockResolvedValue({ data: [vehicle] } as any)
  vi.mocked(appointmentService.list).mockResolvedValue({ data: [] } as any)
})
function setup() {
  render(
    <MemoryRouter>
      <AppointmentPage />
    </MemoryRouter>,
  )
}
async function fill(date: string) {
  fireEvent.change(await screen.findByLabelText('Vehicle'), { target: { value: 'VEH-1' } })
  fireEvent.change(screen.getByLabelText('Preferred date'), { target: { value: date } })
  fireEvent.change(screen.getByLabelText('Preferred time'), { target: { value: '10:30' } })
}

it('labels every booking field', async () => {
  setup()
  for (const label of ['Vehicle', 'Preferred date', 'Preferred time', 'Service', /Issue/])
    expect(await screen.findByLabelText(label)).toBeInTheDocument()
  expect(screen.getByRole('option', { name: 'General maintenance' })).toBeInTheDocument()
})

it('rejects a past date before review', async () => {
  setup()
  await fill('2020-01-01')
  fireEvent.click(screen.getByRole('button', { name: 'Review appointment' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('in the future')
  expect(screen.queryByRole('button', { name: 'Confirm appointment' })).not.toBeInTheDocument()
})

it('shows the server message when booking fails instead of failing silently', async () => {
  vi.mocked(appointmentService.create).mockRejectedValue({
    response: { status: 400, data: { message: 'requestedDate: must be a date in the present' } },
  })
  setup()
  await fill(tomorrow)
  fireEvent.click(screen.getByRole('button', { name: 'Review appointment' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Confirm appointment' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('must be a date in the present')
})

it('books once and shows the reference', async () => {
  vi.mocked(appointmentService.create).mockResolvedValue({
    data: { appointmentId: 'APT-9', requestedDate: tomorrow, requestedTime: '10:30:00' },
  } as any)
  setup()
  await fill(tomorrow)
  fireEvent.click(screen.getByRole('button', { name: 'Review appointment' }))
  const confirm = await screen.findByRole('button', { name: 'Confirm appointment' })
  fireEvent.click(confirm)
  fireEvent.click(confirm)
  expect(await screen.findByText(/Appointment requested: APT-9/)).toBeInTheDocument()
  expect(appointmentService.create).toHaveBeenCalledTimes(1)
})

it('guides a customer with no vehicles to add one', async () => {
  vi.mocked(customerService.vehicles).mockResolvedValue({ data: [] } as any)
  setup()
  expect(await screen.findByRole('link', { name: 'Add a vehicle' })).toHaveAttribute(
    'href',
    '/customer?addVehicle=1',
  )
})
