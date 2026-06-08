import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { visitApi, employeeApi, doctorApi } from '../../api'
import { PageHeader, VisitStatusBadge, Modal, FormField, Spinner, EmptyState } from '../../components/ui'
import { Plus, Stethoscope, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import type { OpdVisit } from '../../types'

export default function OpdRegister() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [empSearch, setEmpSearch] = useState('')
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null)

  const { data: todayVisits, isLoading } = useQuery({
    queryKey: ['today-visits'],
    queryFn: () => visitApi.getToday().then(r => r.data.data),
    refetchInterval: 30_000,
  })

  const { data: doctors } = useQuery({
    queryKey: ['doctors-available'],
    queryFn: () => doctorApi.getAvailable().then(r => r.data.data),
  })

  const { data: empResults } = useQuery({
    queryKey: ['emp-search', empSearch],
    queryFn: () => employeeApi.getAll(empSearch, 0, 10).then(r => r.data.data.content),
    enabled: empSearch.length >= 2,
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Partial<OpdVisit>>({
    defaultValues: { visitType: 'OPD_CONSULTATION' }
  })

  const createMut = useMutation({
    mutationFn: (data: Partial<OpdVisit>) => visitApi.create(data).then(r => r.data.data),
    onSuccess: (visit) => {
      toast.success(`Visit ${visit.visitNumber} registered!`)
      qc.invalidateQueries({ queryKey: ['today-visits'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      setShowForm(false)
      reset()
      setSelectedEmpId(null)
      setEmpSearch('')
      navigate(`/visits/${visit.id}`)
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to create visit'),
  })

  const selectEmployee = (emp: { id: number; fullName: string; employeeCode: string }) => {
    setSelectedEmpId(emp.id)
    setValue('employeeId', emp.id)
    setEmpSearch(`${emp.fullName} (${emp.employeeCode})`)
  }

  const statusCounts = (todayVisits ?? []).reduce((acc, v) => {
    acc[v.status] = (acc[v.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <PageHeader
        title="OPD Register"
        subtitle={`${format(new Date(), 'EEEE, d MMMM yyyy')} · ${todayVisits?.length ?? 0} visits today`}
        actions={
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Register Walk-in
          </button>
        }
      />

      {/* Status summary pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <span key={status} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600">
            {status.replace('_', ' ')}: <strong>{count}</strong>
          </span>
        ))}
      </div>

      <div className="card">
        {isLoading ? (
          <Spinner className="h-48" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Visit #</th>
                  <th className="table-header">Employee</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Doctor</th>
                  <th className="table-header">Complaint</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Time</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(todayVisits ?? []).length === 0 ? (
                  <tr><td colSpan={8}><EmptyState icon={<Stethoscope className="w-10 h-10" />} message="No visits registered today" /></td></tr>
                ) : (
                  (todayVisits ?? []).map(v => (
                    <tr key={v.id} className="table-row">
                      <td className="table-cell font-mono text-xs font-medium text-primary-700">{v.visitNumber}</td>
                      <td className="table-cell">
                        <div className="font-medium">{v.employeeName}</div>
                        <div className="text-xs text-gray-400">{v.employeeCode}</div>
                      </td>
                      <td className="table-cell">
                        <span className={
                          v.visitType === 'FIRST_AID' ? 'badge-yellow' :
                          v.visitType === 'MINOR_ACCIDENT' ? 'badge-red' : 'badge-blue'
                        }>{v.visitType?.replace('_', ' ')}</span>
                      </td>
                      <td className="table-cell">{v.doctorName ?? <span className="text-gray-400">Unassigned</span>}</td>
                      <td className="table-cell max-w-xs truncate text-gray-500">{v.chiefComplaint ?? '—'}</td>
                      <td className="table-cell"><VisitStatusBadge status={v.status} /></td>
                      <td className="table-cell text-xs text-gray-400">
                        {v.registrationTime ? format(new Date(v.registrationTime), 'HH:mm') : '—'}
                      </td>
                      <td className="table-cell">
                        <button className="btn-secondary btn-sm" onClick={() => navigate(`/visits/${v.id}`)}>
                          <Eye className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Walk-in Registration Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); reset(); setEmpSearch(''); setSelectedEmpId(null) }}
        title="Register Walk-in Patient" size="md">
        <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="p-6 space-y-4">
          {/* Employee Search */}
          <FormField label="Employee" required>
            <div className="relative">
              <input
                className="input"
                placeholder="Search by name or employee code…"
                value={empSearch}
                onChange={e => { setEmpSearch(e.target.value); setSelectedEmpId(null) }}
              />
              {empResults && empResults.length > 0 && !selectedEmpId && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {empResults.map(emp => (
                    <button
                      key={emp.id}
                      type="button"
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm"
                      onClick={() => selectEmployee(emp)}
                    >
                      <div className="font-medium">{emp.fullName}</div>
                      <div className="text-xs text-gray-400">{emp.employeeCode} · {emp.department}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FormField>

          <FormField label="Visit Type" required>
            <select {...register('visitType', { required: true })} className="input">
              <option value="OPD_CONSULTATION">OPD Consultation</option>
              <option value="FIRST_AID">First Aid</option>
              <option value="MINOR_ACCIDENT">Minor Accident</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="VACCINATION">Vaccination</option>
              <option value="MEDICAL_CHECKUP">Medical Checkup</option>
            </select>
          </FormField>

          <FormField label="Assign Doctor">
            <select {...register('doctorId', { setValueAs: v => v ? Number(v) : undefined })} className="input">
              <option value="">Assign later</option>
              {(doctors ?? []).map(d => (
                <option key={d.id} value={d.id}>{d.fullName} · {d.specialization}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Chief Complaint">
            <textarea {...register('chiefComplaint')} className="input min-h-[80px]" placeholder="Patient's main complaint…" />
          </FormField>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary flex-1 justify-center"
              disabled={createMut.isPending || !selectedEmpId}
            >
              {createMut.isPending ? 'Registering…' : 'Register Visit'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
