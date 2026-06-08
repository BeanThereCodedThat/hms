import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '../../api'
import {
  LayoutDashboard, Users, UserCheck, Stethoscope, Pill,
  Syringe, Activity, Cross, FileText, BarChart3,
  Settings, Bell, LogOut, Menu, X, Building2
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const navItems = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard',        exact: true },
  { to: '/employees',     icon: Users,           label: 'Employees' },
  { to: '/doctors',       icon: UserCheck,       label: 'Doctors' },
  { to: '/visits',        icon: Stethoscope,     label: 'OPD Visits' },
  { to: '/medicines',    icon: Pill,            label: 'Medicines' },
  { to: '/vaccinations',  icon: Syringe,         label: 'Vaccinations' },
  { to: '/checkups',      icon: Activity,        label: 'Health Checkups' },
  { to: '/first-aid',     icon: Cross,           label: 'First Aid Boxes' },
  { to: '/reports',       icon: BarChart3,       label: 'Reports' },
  { to: '/settings/users',icon: Settings,        label: 'User Management', roles: ['ADMIN'] },
]

export default function Layout() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: countData } = useQuery({
    queryKey: ['notif-count'],
    queryFn: () => notificationApi.getCount().then(r => r.data.data),
    refetchInterval: 60_000,
  })

  const unreadCount = countData ?? 0

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const visibleItems = navItems.filter(item =>
    !item.roles || item.roles.some(r => hasRole(r as any))
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-blue-800">
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary-700" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">OHC Dispensary</div>
          <div className="text-blue-300 text-xs">Management System</div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive
                ? 'bg-blue-800 text-white'
                : 'text-blue-100 hover:bg-blue-800/60 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-blue-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {user?.fullName?.charAt(0) ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">{user?.fullName}</div>
            <div className="text-blue-300 text-xs">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="text-blue-300 hover:text-white transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-primary-900 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-60 bg-primary-900 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:block text-sm text-gray-500">
            Occupational Health Centre
          </div>

          <div className="flex items-center gap-3">
            <NavLink to="/notifications" className="relative text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
            <span className="text-sm text-gray-600 font-medium">{user?.fullName}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}