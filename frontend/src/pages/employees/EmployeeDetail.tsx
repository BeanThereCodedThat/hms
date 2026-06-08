import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { employeeApi, visitApi, vaccinationApi, checkupApi } from '../../api'
import { Spinner, VisitStatusBadge, PageHeader } from '../../components/ui'
import { Edit, ArrowLeft, User, Heart, Stethoscope, Syringe, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'

const TABS = ['Profile', 'Visits', 'Vaccinations', 'Checkups', 'Family'] as const
type Tab = typeof TABS[number]

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [tab, setTab] = useState<Tab>('Profile')
  const empId = Number(id)

  const { data: emp, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeApi.getById(empId).then(r => r.data.data),
  })

  const { data: visits } = useQuery({
    queryKey: ['employee-visits', id],
    queryFn: () => visitApi.getEmployeeHistory(empId).then(r => r.data.data),
    enabled: tab === 'Visits',
  })

  const { data: vaccinations } = useQuery({
    queryKey: ['employee-vaccinations', id],
    queryFn: () => vaccinationApi.getByEmployee(empId).then(r => r.data.data),
    enabled: tab === 'Vaccinations',
  })

  const { data: checkups } = useQuery({
    queryKey: ['employee-checkups', id],
    queryFn: () => checkupApi.getByEmployee(empId).then(r => r.data.data),
    enabled: tab === 'Checkups',
  })

  const { data: family } = useQuery({
    queryKey: ['employee-family', id],
    queryFn: () => employeeApi.getFamily(empId).then(r => r.data.data),
    enabled: tab === 'Family',
  })

  if (isLoading) return <Spinner className="h-64" />
  if (!emp) return <div className="text-center py-12 text-gray-400">Employee not found</div>

  const fmtDate = (d?: string) => d ? format(new Date(d), 'dd MMM yyyy') : '—'

  return (
    <div>
      <PageHeader
        title={emp.fullName}
        subtitle={`${emp.employeeCode} · ${emp.department ?? ''}`}
        actions={
          <div className="flex gap-2">
            <button className="btn-secondary btn-sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {hasRole('ADMIN', 'OPD_STAFF') && (
              <button className="btn-primary btn-sm" onClick={() => navigate(`/employees/${id}/edit`)}>
                <Edit className="w-4 h-4" /> Edit
              </button>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'Profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="card-header"><h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><User className="w-4 h-4" />Personal Info</h2></div>
            <div className="card-body space-y-3">
              {[
                ['Full Name', emp.fullName],
                ['Gender', emp.gender],
                ['Date of Birth', fmtDate(emp.dateOfBirth)],
                ['Blood Group', emp.bloodGroup?.replace('_', ' ')],
                ['Contact', emp.contactNumber],
                ['Email', emp.email],
                ['Address', emp.address],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex gap-3">
                  <span className="text-xs text-gray-400 w-28 flex-shrink-0">{label}</span>
                  <span className="text-sm text-gray-800 font-medium">{value ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Stethoscope className="w-4 h-4" />Employment & Medical</h2></div>
            <div className="card-body space-y-3">
              {[
                ['Department', emp.department],
                ['Designation', emp.designation],
                ['Joining Date', fmtDate(emp.joiningDate)],
                ['Smart Card', emp.smartCardId],
                ['Status', emp.active ? 'Active' : 'Inactive'],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex gap-3">
                  <span className="text-xs text-gray-400 w-28 flex-shrink-0">{label}</span>
                  <span className="text-sm text-gray-800 font-medium">{value ?? '—'}</span>
                </div>
              ))}
              {emp.allergies && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Allergies</p>
                  <p className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded">{emp.allergies}</p>
                </div>
              )}
              {emp.chronicConditions && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Chronic Conditions</p>
                  <p className="text-sm text-gray-700">{emp.chronicConditions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visits Tab */}
      {tab === 'Visits' && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Stethoscope className="w-4 h-4" />Visit History</h2>
            <button className="btn-primary btn-sm" onClick={() => navigate(`/visits?employee=${empId}`)}>New Visit</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="table-header">Visit #</th>
                <th className="table-header">Date</th>
                <th className="table-header">Type</th>
                <th className="table-header">Doctor</th>
                <th className="table-header">Status</th>
                <th className="table-header"></th>
              </tr></thead>
              <tbody>
                {(visits ?? []).length === 0 ? (
                  <tr><td colSpan={6} className="table-cell text-center text-gray-400 py-8">No visits recorded</td></tr>
                ) : (visits ?? []).map(v => (
                  <tr key={v.id} className="table-row">
                    <td className="table-cell font-mono text-xs">{v.visitNumber}</td>
                    <td className="table-cell">{fmtDate(v.visitDate)}</td>
                    <td className="table-cell"><span className="badge-blue text-xs">{v.visitType?.replace('_', ' ')}</span></td>
                    <td className="table-cell">{v.doctorName ?? '—'}</td>
                    <td className="table-cell"><VisitStatusBadge status={v.status} /></td>
                    <td className="table-cell">
                      <button className="btn-secondary btn-sm" onClick={() => navigate(`/visits/${v.id}`)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vaccinations Tab */}
      {tab === 'Vaccinations' && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Syringe className="w-4 h-4" />Vaccination Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="table-header">Vaccine</th>
                <th className="table-header">Type</th>
                <th className="table-header">Administered</th>
                <th className="table-header">Due Date</th>
                <th className="table-header">Status</th>
              </tr></thead>
              <tbody>
                {(vaccinations ?? []).length === 0 ? (
                  <tr><td colSpan={5} className="table-cell text-center text-gray-400 py-8">No vaccination records</td></tr>
                ) : (vaccinations ?? []).map(v => (
                  <tr key={v.id} className="table-row">
                    <td className="table-cell font-medium">{v.vaccineName}</td>
                    <td className="table-cell">{v.vaccineType ?? '—'}</td>
                    <td className="table-cell">{fmtDate(v.administeredDate)}</td>
                    <td className="table-cell">{fmtDate(v.dueDate)}</td>
                    <td className="table-cell">
                      <span className={v.completed ? 'badge-green' : 'badge-yellow'}>{v.completed ? 'Completed' : 'Pending'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Checkups Tab */}
      {tab === 'Checkups' && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Activity className="w-4 h-4" />Health Checkups</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="table-header">Type</th>
                <th className="table-header">Scheduled</th>
                <th className="table-header">Completed</th>
                <th className="table-header">Status</th>
                <th className="table-header">Findings</th>
              </tr></thead>
              <tbody>
                {(checkups ?? []).length === 0 ? (
                  <tr><td colSpan={5} className="table-cell text-center text-gray-400 py-8">No checkup records</td></tr>
                ) : (checkups ?? []).map(c => (
                  <tr key={c.id} className="table-row">
                    <td className="table-cell font-medium">{c.checkupType}</td>
                    <td className="table-cell">{fmtDate(c.scheduledDate)}</td>
                    <td className="table-cell">{fmtDate(c.completedDate)}</td>
                    <td className="table-cell"><span className={
                      c.status === 'COMPLETED' ? 'badge-green' :
                      c.status === 'OVERDUE' ? 'badge-red' :
                      c.status === 'SCHEDULED' ? 'badge-blue' : 'badge-gray'
                    }>{c.status}</span></td>
                    <td className="table-cell text-gray-500 max-w-xs truncate">{c.findings ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Family Tab */}
      {tab === 'Family' && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Heart className="w-4 h-4" />Family Members</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="table-header">Name</th>
                <th className="table-header">Relation</th>
                <th className="table-header">Gender</th>
                <th className="table-header">Date of Birth</th>
                <th className="table-header">Blood Group</th>
              </tr></thead>
              <tbody>
                {(family ?? []).length === 0 ? (
                  <tr><td colSpan={5} className="table-cell text-center text-gray-400 py-8">No family members registered</td></tr>
                ) : (family ?? []).map(f => (
                  <tr key={f.id} className="table-row">
                    <td className="table-cell font-medium">{f.firstName} {f.lastName}</td>
                    <td className="table-cell">{f.relation}</td>
                    <td className="table-cell">{f.gender ?? '—'}</td>
                    <td className="table-cell">{fmtDate(f.dateOfBirth)}</td>
                    <td className="table-cell">{f.bloodGroup?.replace('_', ' ') ?? '—'}</td>
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
