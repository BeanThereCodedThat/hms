import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { checkupApi, employeeApi } from '../../api'
import { PageHeader, Modal, FormField, Spinner, CheckupStatusBadge } from '../../components/ui'
import { Plus, Edit, Trash2, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import type { HealthCheckup } from '../../types'

export default function CheckupList() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<HealthCheckup | null>(null)
  const [empSearch, setEmpSearch] = useState('')

  const { data: upcoming } = useQuery({
    queryKey: ['checkups-upcoming'],
    queryFn: () => checkupApi.getUpcoming(30).then(r => r.data.data),
  })

  const { data: scheduled } = useQuery({
    queryKey: ['checkups-scheduled'],
    queryFn: () => checkupApi.getByStatus('SCHEDULED').then(r => r.data.data),
  })

  const { data: empResults } = useQuery({
    queryKey: ['emp-search-chk', empSearch],
    queryFn: () => employeeApi.getAll(empSearch, 0, 8).then(r => r.data.data.content),
    enabled: empSearch.length >= 2,
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Partial<HealthCheckup>>({
    defaultValues: { status: 'SCHEDULED' },
  })

  const saveMut = useMutation({
    mutationFn: (data: Partial<HealthCheckup>) =>
      editItem
        ? checkupApi.update(editItem.id, data).then(r => r.data.data)
        : checkupApi.create(data).then(r => r.data.data),
    onSuccess: () => {
      toast.success(editItem ? 'Checkup updated' : 'Checkup scheduled')
      qc.invalidateQueries({ queryKey: ['checkups-upcoming'] })
      qc.invalidateQueries({ queryKey: ['checkups-scheduled'] })
      setShowForm(false)
      setEditItem(null)
      reset()
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Save failed'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => checkupApi.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['checkups-scheduled'] }) },
  })

  const openEdit = (hc: HealthCheckup) => {
    setEditItem(hc)
    Object.entries(hc).forEach(([k, val]) => setValue(k as any, val))
    setShowForm(true)
  }

  const fmtDate = (d?: string) => d ? format(new Date(d), 'dd MMM yyyy') : '—'

  return (
    <div>
      <PageHeader
        title="Health Checkups"
        subtitle="Schedule and track occupational health examinations"
        actions={
          <button className="btn-primary" onClick={() => { setEditItem(null); reset(); setShowForm(true) }}>
            <Plus className="w-4 h-4" /> Schedule Checkup
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> Upcoming (Next 30 Days)
            </h2>
            <span className="badge-blue">{upcoming?.length ?? 0}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {(upcoming ?? []).length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No upcoming checkups</div>
            ) : (upcoming ?? []).slice(0, 6).map(hc => (
              <div key={hc.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{hc.employeeName}</p>
                  <p className="text-xs text-gray-500">{hc.checkupType} · {fmtDate(hc.scheduledDate)}</p>
                </div>
                <CheckupStatusBadge status={hc.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700">All Scheduled</h2>
            <span className="badge-blue">{scheduled?.length ?? 0}</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {(scheduled ?? []).length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No scheduled checkups</div>
            ) : (scheduled ?? []).map(hc => (
              <div key={hc.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium">{hc.employeeName}</p>
                  <p className="text-xs text-gray-400">{hc.checkupType} · {fmtDate(hc.scheduledDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckupStatusBadge status={hc.status} />
                  <div className="flex gap-1">
                    <button className="btn-secondary btn-sm" onClick={() => openEdit(hc)}>
                      <Edit className="w-3 h-3" />
                    </button>
                    <button className="btn-danger btn-sm" onClick={() => deleteMut.mutate(hc.id)}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); reset() }}
        title={editItem ? 'Edit Checkup' : 'Schedule Health Checkup'} size="md">
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="p-6 space-y-4">
          {!editItem && (
            <FormField label="Employee" required>
              <input
                className="input mb-1"
                placeholder="Type employee name to search…"
                value={empSearch}
                onChange={e => setEmpSearch(e.target.value)}
              />
              {empResults && empResults.length > 0 && (
                <select
                  {...register('employeeId', { required: true, setValueAs: v => Number(v) })}
                  className="input"
                >
                  <option value={0}>Select employee…</option>
                  {empResults.map(e => (
                    <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>
                  ))}
                </select>
              )}
            </FormField>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Checkup Type" required error={errors.checkupType?.message}>
              <input
                {...register('checkupType', { required: 'Required' })}
                className={`input ${errors.checkupType ? 'input-error' : ''}`}
                placeholder="Annual Medical / Pre-Employment"
              />
            </FormField>
            <FormField label="Status">
              <select {...register('status')} className="input">
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </FormField>
            <FormField label="Scheduled Date">
              <input {...register('scheduledDate')} type="date" className="input" />
            </FormField>
            <FormField label="Completed Date">
              <input {...register('completedDate')} type="date" className="input" />
            </FormField>
            <FormField label="Conducted By">
              <input {...register('conductedBy')} className="input" placeholder="Dr. Smith" />
            </FormField>
            <FormField label="Next Due Date">
              <input {...register('nextDueDate')} type="date" className="input" />
            </FormField>
          </div>
          <FormField label="Findings">
            <textarea {...register('findings')} className="input min-h-[60px]" placeholder="Medical findings…" />
          </FormField>
          <FormField label="Recommendations">
            <textarea {...register('recommendations')} className="input min-h-[60px]" placeholder="Follow-up actions…" />
          </FormField>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={saveMut.isPending}>
              {saveMut.isPending ? 'Saving…' : editItem ? 'Update' : 'Schedule'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
