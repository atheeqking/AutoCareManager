import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { CustomerPortalPage } from './CustomerPortalPage'
import { customerService } from '../services/customerService'

vi.mock('../services/customerService', () => ({ customerService: { mine: vi.fn(), vehicles: vi.fn() } }))
beforeEach(() => { vi.clearAllMocks(); localStorage.clear() })
function setup() { render(<MemoryRouter><AuthProvider><CustomerPortalPage/></AuthProvider></MemoryRouter>) }
it('displays saved contact details without requiring a second signup', async () => {
  vi.mocked(customerService.mine).mockResolvedValue({ data: { customerId: 'CUS-1', name: 'customer1', phone: '5551234567', email: 'customer@example.test' } } as any)
  vi.mocked(customerService.vehicles).mockResolvedValue({ data: [] } as any)
  setup()
  expect(await screen.findByText('customer@example.test')).toBeInTheDocument()
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Edit details' }))
  expect(screen.getByLabelText('Full name')).toHaveValue('customer1')
})
it('offers one-time setup for an old account with no profile without a load error', async () => {
  vi.mocked(customerService.mine).mockRejectedValue({ response: { status: 404 } })
  setup()
  expect(await screen.findByRole('heading', { name: 'Complete your profile' })).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
it('does not mistake a failed vehicle request for a missing customer profile', async () => {
  vi.mocked(customerService.mine).mockResolvedValue({ data: { customerId: 'CUS-1', name: 'customer1', phone: '5551234567', email: 'customer@example.test' } } as any)
  vi.mocked(customerService.vehicles).mockRejectedValue({ response: { status: 404 } })
  setup()
  expect(await screen.findByRole('alert')).toHaveTextContent('vehicles could not be loaded')
  expect(screen.queryByRole('heading', { name: 'Complete your profile' })).not.toBeInTheDocument()
})
