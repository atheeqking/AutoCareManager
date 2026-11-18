import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, expect, it } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { PageNavigation } from './PageNavigation'
import { ProtectedRoute } from '../routes/ProtectedRoute'

beforeEach(() => localStorage.clear())
it('returns to the previous in-app page', async () => {
  window.history.replaceState({ idx: 1 }, '')
  render(
    <MemoryRouter initialEntries={['/first', '/second']} initialIndex={1}>
      <AuthProvider>
        <PageNavigation />
        <Routes>
          <Route path="/first" element={<h1>First page</h1>} />
          <Route path="/second" element={<h1>Second page</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Back to previous page' }))
  expect(await screen.findByRole('heading', { name: 'First page' })).toBeInTheDocument()
})
it('uses the role dashboard when a page was opened directly', async () => {
  window.history.replaceState(null, '')
  localStorage.setItem('autocare.user', JSON.stringify({ role: 'EMPLOYEE', username: 'employee' }))
  render(
    <MemoryRouter initialEntries={['/workshop/customers']}>
      <AuthProvider>
        <PageNavigation />
        <Routes>
          <Route path="/workshop/customers" element={<h1>Customers</h1>} />
          <Route path="/workshop/employee" element={<h1>Workshop dashboard</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Back to previous page' }))
  expect(await screen.findByRole('heading', { name: 'Workshop dashboard' })).toBeInTheDocument()
})
it('shows the workshop menu, marks the current page, and logs out to the home page', async () => {
  localStorage.setItem('autocare.accessToken', 'token')
  localStorage.setItem('autocare.user', JSON.stringify({ role: 'MANAGER', username: 'manager' }))
  render(
    <MemoryRouter initialEntries={['/workshop/appointments']}>
      <AuthProvider>
        <PageNavigation />
        <Routes>
          <Route path="/" element={<h1>Home page</h1>} />
          <Route path="/login" element={<h1>Login page</h1>} />
          <Route element={<ProtectedRoute roles={['MANAGER']} />}>
            <Route path="/workshop/appointments" element={<h1>Appointments</h1>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
  const menu = screen.getByRole('navigation', { name: 'Main' })
  expect(within(menu).getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
    'href',
    '/workshop/manager',
  )
  expect(within(menu).getByRole('link', { name: 'Appointments' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  fireEvent.click(within(menu).getByRole('button', { name: 'Log out' }))
  expect(await screen.findByRole('heading', { name: 'Home page' })).toBeInTheDocument()
  expect(localStorage.getItem('autocare.accessToken')).toBeNull()
})
it('shows customer links and a mobile menu toggle', () => {
  localStorage.setItem('autocare.user', JSON.stringify({ role: 'CUSTOMER', username: 'priya' }))
  render(
    <MemoryRouter initialEntries={['/customer']}>
      <AuthProvider>
        <PageNavigation />
      </AuthProvider>
    </MemoryRouter>,
  )
  const toggle = screen.getByRole('button', { name: 'Menu' })
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  fireEvent.click(toggle)
  expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute('aria-expanded', 'true')
  for (const name of ['Dashboard', 'My profile', 'Appointments', 'Notifications'])
    expect(screen.getByRole('link', { name })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Customers' })).not.toBeInTheDocument()
})
