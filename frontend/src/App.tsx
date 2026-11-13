import { AppRoutes } from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'
import { PageNavigation } from './components/PageNavigation'

function App() {
  return (
    <AuthProvider>
      <PageNavigation />
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
