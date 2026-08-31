import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '../../context/AuthContext'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  beforeEach(() => localStorage.clear())
  it('renders workshop and customer entry points', () => {
    render(<BrowserRouter><AuthProvider><LoginPage /></AuthProvider></BrowserRouter>)
    expect(screen.getByRole('heading', { name: 'Workshop Login' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue as Guest' })).toBeInTheDocument()
  })
  it('validates a missing username before calling the API', () => {
    render(<BrowserRouter><AuthProvider><LoginPage /></AuthProvider></BrowserRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Username is required.')
  })
})
