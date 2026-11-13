import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { PageNavigation } from './PageNavigation'

beforeEach(() => localStorage.clear())
it('returns to the previous in-app page', async () => {
  window.history.replaceState({ idx: 1 }, '')
  render(<MemoryRouter initialEntries={['/first', '/second']} initialIndex={1}><AuthProvider><PageNavigation/><Routes><Route path="/first" element={<h1>First page</h1>}/><Route path="/second" element={<h1>Second page</h1>}/></Routes></AuthProvider></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: 'Back to previous page' }))
  expect(await screen.findByRole('heading', { name: 'First page' })).toBeInTheDocument()
})
it('uses the role dashboard when a page was opened directly', async () => {
  window.history.replaceState(null, '')
  localStorage.setItem('autocare.user', JSON.stringify({ role: 'EMPLOYEE', username: 'employee' }))
  render(<MemoryRouter initialEntries={['/workshop/customers']}><AuthProvider><PageNavigation/><Routes><Route path="/workshop/customers" element={<h1>Customers</h1>}/><Route path="/workshop/employee" element={<h1>Workshop dashboard</h1>}/></Routes></AuthProvider></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: 'Back to previous page' }))
  expect(await screen.findByRole('heading', { name: 'Workshop dashboard' })).toBeInTheDocument()
})
