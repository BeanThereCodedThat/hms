import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api'
import { Spinner, VisitStatusBadge, StockStatusBadge } from '../components/ui'
import {
  Users, Stethoscope, AlertTriangle, Package,
  Syringe, Activity, ShieldAlert, Clock
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format } from 'date-fns'
import type { DashboardData } from '../types'

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  bg: string
  subtitle?: string
}

function StatCard({ title, value, icon, color, bg, subtitle }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${bg}`}>
        <div className={color}>{icon}</div>
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then(r => r.data.data),
    refetchInterval: 60_000,
  })

  if (isLoading) return <Spinner className="h-64" />

  const d = data as DashboardData

  const visitTypeData = [
    { name: 'OPD', value: Number(d?.todayVisits ?? 0) - Number(d?.todayFirstAid ?? 0) - Number(d?.todayAccidents ?? 0), fill: '#3b82f6' },
    { name: 'First Aid', value: Number(d?.todayFirstAid ?? 0), fill: '#f59e0b' },
    { name: 'Accidents', value: Number(d?.todayAccidents ?? 0), fill: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stat Cards Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={d?.totalEmployees ?? 0} icon={<Users className="w-5 h-5" />} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Today's Visits" value={d?.todayVisits ?? 0} icon={<Stethoscope className="w-5 h-5" />} color="text-green-600" bg="bg-green-50" subtitle="All types" />
        <StatCard title="First Aid Today" value={d?.todayFirstAid ?? 0} icon={<ShieldAlert className="w-5 h-5" />} color="text-yellow-600" bg="bg-yellow-50" />
        <StatCard title="Accidents Today" value={d?.todayAccidents ?? 0} icon={<AlertTriangle className="w-5 h-5" />} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Stat Cards Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Low Stock Items" value={d?.lowStockMedicines ?? 0} icon={<Package className="w-5 h-5" />}
          color={(d?.lowStockMedicines ?? 0) > 0 ? "text-red-600" : "text-gray-500"}
          bg={(d?.lowStockMedicines ?? 0) > 0 ? "bg-red-50" : "bg-gray-50"} />
        <StatCard title="Expiring Soon" value={d?.expiringMedicines ?? 0} icon={<Clock className="w-5 h-5" />}
          color={(d?.expiringMedicines ?? 0) > 0 ? "text-yellow-600" : "text-gray-500"}
          bg={(d?.expiringMedicines ?? 0) > 0 ? "bg-yellow-50" : "bg-gray-50"}
          subtitle="Within 90 days" />
        <StatCard title="Upcoming Vaccinations" value={d?.upcomingVaccinations ?? 0} icon={<Syringe className="w-5 h-5" />} color="text-purple-600" bg="bg-purple-50" subtitle="Next 30 days" />
        <StatCard title="Upcoming Checkups" value={d?.upcomingCheckups ?? 0} icon={<Activity className="w-5 h-5" />} color="text-indigo-600" bg="bg-indigo-50" subtitle="Next 30 days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Visit Chart */}
        <div className="card col-span-1">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-800">Today's Visit Breakdown</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={visitTypeData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {visitTypeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Visits */}
        <div className="card col-span-2">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-800">Today's OPD Register</h2>
            <span className="badge-blue">{d?.todayVisits ?? 0} visits</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Visit #</th>
                  <th className="table-header">Employee</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Time</th>
                </tr>
              </thead>
              <tbody>
                {(d?.recentVisits ?? []).length === 0 ? (
                  <tr><td colSpan={5} className="table-cell text-center text-gray-400 py-8">No visits today</td></tr>
                ) : (
                  (d?.recentVisits ?? []).map(v => (
                    <tr key={v.id} className="table-row">
                      <td className="table-cell font-mono text-xs">{v.visitNumber}</td>
                      <td className="table-cell font-medium">{v.employeeName}</td>
                      <td className="table-cell">
                        <span className="badge-blue text-xs">{v.visitType?.replace('_', ' ')}</span>
                      </td>
                      <td className="table-cell"><VisitStatusBadge status={v.status} /></td>
                      <td className="table-cell text-gray-400 text-xs">
                        {v.registrationTime ? format(new Date(v.registrationTime), 'HH:mm') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {(d?.lowStockList ?? []).length > 0 && (
        <div className="card border-l-4 border-l-red-400">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Low Stock Alerts
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Medicine</th>
                  <th className="table-header">Current Stock</th>
                  <th className="table-header">Min Level</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {(d?.lowStockList ?? []).map(m => (
                  <tr key={m.id} className="table-row">
                    <td className="table-cell font-medium">{m.name}<span className="text-xs text-gray-400 ml-1">({m.medicineCode})</span></td>
                    <td className="table-cell font-bold text-red-600">{m.currentStock} {m.unit}</td>
                    <td className="table-cell text-gray-500">{m.minStockLevel} {m.unit}</td>
                    <td className="table-cell"><StockStatusBadge status={m.stockStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
