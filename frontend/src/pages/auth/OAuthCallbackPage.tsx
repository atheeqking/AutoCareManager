import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { homePath } from './LoginPage'

export function OAuthCallbackPage() { const { completeLogin } = useAuth(); const navigate = useNavigate(); useEffect(() => { const token = new URLSearchParams(window.location.hash.slice(1)).get('accessToken'); if (!token) { navigate('/login', { replace: true }); return } localStorage.setItem('autocare.accessToken', token); authService.me().then(({ data }) => { completeLogin({ accessToken: token, tokenType: 'Bearer', user: data }); navigate(homePath(data.role), { replace: true }) }).catch(() => navigate('/login', { replace: true })) }, [completeLogin, navigate]); return <p className="p-8 text-slate-100">Completing Google sign-in…</p> }
