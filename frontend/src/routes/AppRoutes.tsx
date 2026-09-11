import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { OAuthCallbackPage } from '../pages/auth/OAuthCallbackPage'
import { HomePlaceholder } from '../pages/HomePlaceholder'
import { CustomerManagementPage } from '../pages/CustomerManagementPage'
import { CustomerPortalPage } from '../pages/CustomerPortalPage'
import { VehicleDetailPage } from '../pages/VehicleDetailPage'
import { AppointmentPage } from '../pages/AppointmentPage'
import { WorkshopAppointmentsPage } from '../pages/WorkshopAppointmentsPage'
import { ServiceCasesPage } from '../pages/ServiceCasesPage'
import { DashboardPage } from '../pages/DashboardPage'
import { NotificationsPage } from '../pages/NotificationsPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />
      <Route element={<ProtectedRoute roles={['GUEST']} />}><Route path="/guest" element={<HomePlaceholder />} /></Route>
      <Route element={<ProtectedRoute roles={['CUSTOMER']} />}><Route path="/customer/*" element={<CustomerPortalPage />} /></Route>
      <Route element={<ProtectedRoute roles={['CUSTOMER']} />}><Route path="/customer/dashboard" element={<DashboardPage />} /><Route path="/customer/notifications" element={<NotificationsPage />} /></Route>
      <Route element={<ProtectedRoute roles={['CUSTOMER']} />}><Route path="/customer/appointments" element={<AppointmentPage />} /></Route>
      <Route element={<ProtectedRoute roles={['CUSTOMER', 'EMPLOYEE', 'MANAGER', 'OWNER']} />}><Route path="/vehicles/:vehicleId" element={<VehicleDetailPage />} /></Route>
      <Route element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'OWNER']} />}><Route path="/workshop/customers" element={<CustomerManagementPage />} /><Route path="/workshop/employee" element={<DashboardPage />} /><Route path="/workshop/dashboard" element={<DashboardPage />} /></Route>
      <Route element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'OWNER']} />}><Route path="/workshop/appointments" element={<WorkshopAppointmentsPage />} /></Route>
      <Route element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'OWNER']} />}><Route path="/workshop/service-cases" element={<ServiceCasesPage />} /></Route>
      <Route element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'OWNER']} />}><Route path="/workshop/service-cases/:serviceCaseId" element={<ServiceCasesPage />} /></Route>
      <Route element={<ProtectedRoute roles={['MANAGER', 'OWNER']} />}><Route path="/workshop/manager" element={<DashboardPage />} /></Route>
      <Route element={<ProtectedRoute roles={['OWNER']} />}><Route path="/workshop/owner" element={<DashboardPage />} /></Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
