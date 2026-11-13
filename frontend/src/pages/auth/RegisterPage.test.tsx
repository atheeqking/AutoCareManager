import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { RegisterPage } from './RegisterPage'

vi.mock('../../services/authService', () => ({ authService: { register: vi.fn() } }))
beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})
function setup() {
  render(
    <MemoryRouter initialEntries={['/register']}>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/customer/dashboard" element={<h1>Customer dashboard</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}
describe('customer registration', () => {
  it('limits typed and pasted phone input to ten digits', () => {
    setup()
    const phone = screen.getByLabelText(/Phone number/)
    fireEvent.change(phone, { target: { value: '12345678901234' } })
    expect(phone).toHaveValue('1234567890')
    fireEvent.change(phone, { target: { value: '(555) 123-4567' } })
    expect(phone).toHaveValue('5551234567')
    expect(phone).toHaveAttribute('maxlength', '10')
  })
  it('creates the account with contact details and signs into the dashboard', async () => {
    vi.mocked(authService.register).mockResolvedValue({
      data: {
        accessToken: 'test-token',
        tokenType: 'Bearer',
        user: {
          id: 1,
          username: 'customer1',
          email: 'customer@example.test',
          role: 'CUSTOMER',
          authenticationType: 'LOCAL',
        },
      },
    } as any)
    setup()
    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: 'customer1' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'customer@example.test' } })
    fireEvent.change(screen.getByLabelText(/Phone number/), { target: { value: '5551234567' } })
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'SafePassword123!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    await screen.findByRole('heading', { name: 'Customer dashboard' })
    expect(authService.register).toHaveBeenCalledWith(
      'customer1',
      'customer@example.test',
      'SafePassword123!',
      '5551234567',
    )
    await waitFor(() => expect(localStorage.getItem('autocare.accessToken')).toBe('test-token'))
  })
})
