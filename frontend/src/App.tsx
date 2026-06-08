import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import Dashboard from './pages/Dashboard'
import EmployeeList from './pages/employees/EmployeeList'
import EmployeeForm from './pages/employees/EmployeeForm'
import EmployeeDetail from './pages/employees/EmployeeDetail'
import DoctorList from './pages/doctors/DoctorList'
import OpdRegister from './pages/visits/OpdRegister'
import VisitDetail from './pages/visits/VisitDetail'
import MedicineList from './pages/medicines/MedicineList'
import MedicineForm from './pages/medicines/MedicineForm'
import StockManagement from './pages/medicines/StockManagement'
import VaccinationList from './pages/vaccinations/VaccinationList'
import CheckupList from './pages/checkups/CheckupList'
import FirstAidBoxList from './pages/firstaid/FirstAidBoxList'
import ReportsPage from './pages/reports/ReportsPage'
import UserManagement from './pages/settings/UserManagement'
import NotificationsPage from './pages/NotificationsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
      } />
      <Route path="/" element={
        <ProtectedRoute><Layout /></ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/new" element={<EmployeeForm />} />
        <Route path="employees/:id" element={<EmployeeDetail />} />
        <Route path="employees/:id/edit" element={<EmployeeForm />} />
        <Route path="doctors" element={<DoctorList />} />
        <Route path="visits" element={<OpdRegister />} />
        <Route path="visits/:id" element={<VisitDetail />} />
        <Route path="medicines" element={<MedicineList />} />
        <Route path="medicines/new" element={<MedicineForm />} />
        <Route path="medicines/stock" element={<StockManagement />} />
        <Route path="medicines/:id/edit" element={<MedicineForm />} />
        <Route path="vaccinations" element={<VaccinationList />} />
        <Route path="checkups" element={<CheckupList />} />
        <Route path="first-aid" element={<FirstAidBoxList />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings/users" element={<UserManagement />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
