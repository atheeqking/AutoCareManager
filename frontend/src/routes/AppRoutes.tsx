import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { OAuthCallbackPage } from '../pages/auth/OAuthCallbackPage'
import { LandingPage } from '../pages/LandingPage'
import { GuestAppointmentPage } from '../pages/GuestAppointmentPage'
import { CustomerManagementPage } from '../pages/CustomerManagementPage'
import { CustomerPortalPage } from '../pages/CustomerPortalPage'
import { CustomerServiceCasePage } from '../pages/CustomerServiceCasePage'
import { VehicleDetailPage } from '../pages/VehicleDetailPage'
import { AppointmentPage } from '../pages/AppointmentPage'
import { WorkshopAppointmentsPage } from '../pages/WorkshopAppointmentsPage'
import { ServiceCasesPage } from '../pages/ServiceCasesPage'
import { DashboardPage } from '../pages/DashboardPage'
import { NotificationsPage } from '../pages/NotificationsPage'
import { ProtectedRoute } from './ProtectedRoute'
import { WORKSHOP_ROLES } from './paths'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />

      <Route element={<ProtectedRoute roles={['GUEST']} />}>
        <Route path="/guest" element={<Navigate to="/guest/appointments" replace />} />
        <Route path="/guest/appointments" element={<GuestAppointmentPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
        <Route path="/customer" element={<CustomerPortalPage />} />
        <Route path="/customer/dashboard" element={<DashboardPage />} />
        <Route path="/customer/notifications" element={<NotificationsPage />} />
        <Route path="/customer/appointments" element={<AppointmentPage />} />
        <Route path="/customer/service-cases/:serviceCaseId" element={<CustomerServiceCasePage />} />
        <Route path="/customer/*" element={<Navigate to="/customer" replace />} />
      </Route>

      <Route element={<ProtectedRoute roles={['CUSTOMER', ...WORKSHOP_ROLES]} />}>
        <Route path="/vehicles/:vehicleId" element={<VehicleDetailPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={WORKSHOP_ROLES} />}>
        <Route path="/workshop/customers" element={<CustomerManagementPage />} />
        <Route path="/workshop/employee" element={<DashboardPage />} />
        <Route path="/workshop/dashboard" element={<DashboardPage />} />
        <Route path="/workshop/appointments" element={<WorkshopAppointmentsPage />} />
        <Route path="/workshop/service-cases" element={<ServiceCasesPage />} />
        <Route path="/workshop/service-cases/:serviceCaseId" element={<ServiceCasesPage />} />
      </Route>
      <Route element={<ProtectedRoute roles={['MANAGER', 'OWNER']} />}>
        <Route path="/workshop/manager" element={<DashboardPage />} />
      </Route>
      <Route element={<ProtectedRoute roles={['OWNER']} />}>
        <Route path="/workshop/owner" element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
