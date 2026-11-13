import { appointmentPath } from '../../routes/appointmentPath'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { homePath } from './LoginPage'

export function OAuthCallbackPage() {
  const { completeLogin } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get('accessToken')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }
    localStorage.setItem('autocare.accessToken', token)
    authService
      .me()
      .then(({ data }) => {
        completeLogin({ accessToken: token, tokenType: 'Bearer', user: data })
        const booking = sessionStorage.getItem('autocare.afterLogin') === 'appointments'
        sessionStorage.removeItem('autocare.afterLogin')
        navigate(booking ? appointmentPath(data.role) : homePath(data.role), { replace: true })
      })
      .catch(() => navigate('/login', { replace: true }))
  }, [completeLogin, navigate])
  return <p className="p-8 text-slate-900">Completing Google sign-in…</p>
}
