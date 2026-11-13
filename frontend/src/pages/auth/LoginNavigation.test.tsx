import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../context/AuthContext'
import { LoginPage } from './LoginPage'
import { authService } from '../../services/authService'
vi.mock('../../services/authService', () => ({ authService: { login: vi.fn(), guest: vi.fn() } }))
beforeEach(() => { vi.clearAllMocks(); localStorage.clear() })
function setup() { render(<MemoryRouter initialEntries={['/login?next=appointments']}><AuthProvider><Routes><Route path="/login" element={<LoginPage/>}/><Route path="/customer/appointments" element={<h1>Customer appointment page</h1>}/><Route path="/guest/appointments" element={<h1>Guest appointment page</h1>}/></Routes></AuthProvider></MemoryRouter>) }
it('continues to appointments after signing in from the landing tile', async () => {
 vi.mocked(authService.login).mockResolvedValue({ data: { accessToken: 'customer-token', tokenType: 'Bearer', user: { role: 'CUSTOMER', username: 'customer' } } } as any)
 setup()
 fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'customer' } })
 fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } })
 fireEvent.click(screen.getByRole('button', { name: 'Login' }))
 expect(await screen.findByRole('heading', { name: 'Customer appointment page' })).toBeInTheDocument()
})
it('continues as guest directly to booking, without profile setup', async () => {
 vi.mocked(authService.guest).mockResolvedValue({ data: { accessToken: 'guest-token', tokenType: 'Bearer', user: { role: 'GUEST', username: 'guest' } } } as any)
 setup()
 fireEvent.click(screen.getByRole('button', { name: 'Continue as Guest' }))
 expect(await screen.findByRole('heading', { name: 'Guest appointment page' })).toBeInTheDocument()
 expect(authService.login).not.toHaveBeenCalled()
})
