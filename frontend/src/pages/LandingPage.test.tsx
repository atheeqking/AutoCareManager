import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { LandingPage } from './LandingPage'
beforeEach(() => localStorage.clear())
function setup(role?: string) {
  if (role) localStorage.setItem('autocare.user', JSON.stringify({ role }))
  render(
    <MemoryRouter>
      <AuthProvider>
        <LandingPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}
it('shows company information and routes anonymous appointment requests through login', () => {
  setup()
  expect(screen.getByRole('heading', { name: 'AutoCare Manager' })).toBeInTheDocument()
  expect(screen.getByText('Routine servicing & oil changes')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /^Appointment/ })).toHaveAttribute(
    'href',
    '/login?next=appointments',
  )
})
it.each([
  ['CUSTOMER', '/customer/appointments'],
  ['GUEST', '/guest/appointments'],
  ['EMPLOYEE', '/workshop/appointments'],
])('routes %s directly to appointments', (role, path) => {
  setup(role)
  expect(screen.getByRole('link', { name: /^Appointment/ })).toHaveAttribute('href', path)
})
