import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { vaccinationApi, employeeApi } from '../../api'
import { PageHeader, Modal, FormField, Spinner, EmptyState, ConfirmDialog } from '../../components/ui'
import { Plus, Edit, Trash2, Syringe } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import type { Vaccination } from '../../types'
import clsx from 'clsx'

type TabKey = 'upcoming' | 'overdue' | 'all'

export default function VaccinationList() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<TabKey>('upcoming')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Vaccination | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [empSearch, setEmpSearch] = useState('')
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null)

  const { data: upcoming, isLoading: loadUpcoming } = useQuery({
    queryKey: ['vaccinations-upcoming'],
    queryFn: () => vaccinationApi.getUpcoming(30).then(r => r.data.data),
    enabled: tab === 'upcoming',
  })

  const { data: overdue, isLoading: loadOverdue } = useQuery({
    queryKey: ['vaccinations-overdue'],
    queryFn: () => vaccinationApi.getOverdue().then(r => r.data.data),
    enabled: tab === 'overdue',
  })

  const { data: empVaccinations, isLoading: loadEmp } = useQuery({
    queryKey: ['vaccinations-emp', selectedEmpId],
    queryFn: () => vaccinationApi.getByEmployee(selectedEmpId!).then(r => r.data.data),
    enabled: tab === 'all' && !!selectedEmpId,
  })

  const { data: empResults } = useQuery({
    queryKey: ['emp-search-vac', empSearch],
    queryFn: () => employeeApi.getAll(empSearch, 0, 8).then(r => r.data.data.content),
    enabled: empSearch.length >= 2,
  })

  const isLoading = loadUpcoming || loadOverdue || loadEmp
  const records = tab === 'upcoming' ? (upcoming ?? []) : tab === 'overdue' ? (overdue ?? []) : (empVaccinations ?? [])

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Partial<Vaccination>>({
    defaultValues: { completed: false }
  })

  const saveMut = useMutation({
    mutationFn: (data: Partial<Vaccination>) =>
      editItem
        ? vaccinationApi.update(editItem.id, data).then(r => r.data.data)
        : vaccinationApi.create(data).then(r => r.data.data),
    onSuccess: () => {
      toast.success(editItem ? 'Vaccination updated' : 'Vaccination record created')
      qc.invalidateQueries({ queryKey: ['vaccinations-upcoming'] })
      qc.invalidateQueries({ queryKey: ['vaccinations-overdue'] })
      qc.invalidateQueries({ queryKey: ['vaccinations-emp'] })
      setShowForm(false); setEditItem(null); reset()
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Save failed'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => vaccinationApi.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['vaccinations-upcoming'] }) },
  })

  const openEdit = (v: Vaccination) => {
    setEditItem(v)
    Object.entries(v).forEach(([k, val]) => setValue(k as any, val))
    setShowForm(true)
  }

  const fmtDate = (d?: string) => d ? format(new Date(d), 'dd MMM yyyy') : '—'

  const isOverdueDate = (d?: string) => d ? new Date(d) < new Date() : false

  return (
    <div>
      <PageHeader
        title="Vaccinations"
        subtitle="Track and manage employee vaccination records"
        actions={
          <button className="btn-primary" onClick={() => { setEditItem(null); reset(); setShowForm(true) }}>
            <Plus className="w-4 h-4" /> Add Record
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {([
          { key: 'upcoming', label: `Upcoming (30 days)` },
          { key: 'overdue',  label: 'Overdue' },
          { key: 'all',      label: 'By Employee' },
        ] as { key: TabKey; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx('px-4 py-2 rounded-lg text-sm font-medium border transition-all',
              tab === t.key
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Employee search for "By Employee" tab */}
      {tab === 'all' && (
        <div className="card mb-4 p-4">
          <div className="relative max-w-sm">
            <input
              className="input"
              placeholder="Search employee…"
              value={empSearch}
              onChange={e => { setEmpSearch(e.target.value); setSelectedEmpId(null) }}
            />
            {empResults && empResults.length > 0 && !selectedEmpId && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {empResults.map(emp => (
                  <button
                    key={emp.id}
                    type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm"
                    onClick={() => { setSelectedEmpId(emp.id); setEmpSearch(emp.fullName) }}
                  >
                    <div className="font-medium">{emp.fullName}</div>
                    <div className="text-xs text-gray-400">{emp.employeeCode}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card">
        {isLoading ? (
          <Spinner className="h-48" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Employee</th>
                  <th className="table-header">Vaccine</th>
                  <th className="table-header">Dose</th>
                  <th className="table-header">Administered</th>
                  <th className="table-header">Due Date</th>
                  <th className="table-header">Next Due</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={8}>
                    <EmptyState icon={<Syringe className="w-10 h-10" />} message="No vaccination records found" />
                  </td></tr>
                ) : records.map(v => (
                  <tr key={v.id} className={clsx('table-row', isOverdueDate(v.dueDate) && !v.completed && 'bg-red-50/40')}>
                    <td className="table-cell font-medium">{v.employeeName}</td>
                    <td className="table-cell">
                      <div className="font-medium">{v.vaccineName}</div>
                      {v.vaccineType && <div className="text-xs text-gray-400">{v.vaccineType}</div>}
                    </td>
                    <td className="table-cell">{v.doseNumber ?? '—'}</td>
                    <td className="table-cell">{fmtDate(v.administeredDate)}</td>
                    <td className={clsx('table-cell font-medium',
                      isOverdueDate(v.dueDate) && !v.completed ? 'text-red-600' : ''
                    )}>
                      {fmtDate(v.dueDate)}
                    </td>
                    <td className="table-cell">{fmtDate(v.nextDueDate)}</td>
                    <td className="table-cell">
                      <span className={v.completed ? 'badge-green' : isOverdueDate(v.dueDate) ? 'badge-red' : 'badge-yellow'}>
                        {v.completed ? 'Completed' : isOverdueDate(v.dueDate) ? 'Overdue' : 'Pending'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button className="btn-secondary btn-sm" onClick={() => openEdit(v)}>
                          <Edit className="w-3 h-3" />
                        </button>
                        <button className="btn-danger btn-sm" onClick={() => setDeleteId(v.id)}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); reset() }}
        title={editItem ? 'Edit Vaccination' : 'Add Vaccination Record'} size="md">
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="p-6 space-y-4">
          {!editItem && (
            <FormField label="Employee" required>
              <select {...register('employeeId', { required: true, setValueAs: v => Number(v) })} className="input">
                <option value={0}>Select employee…</option>
                {empResults?.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>)}
              </select>
              <input
                className="input mt-1" placeholder="Type to search employees…"
                value={empSearch}
                onChange={e => setEmpSearch(e.target.value)}
              />
            </FormField>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Vaccine Name" required error={errors.vaccineName?.message}>
              <input {...register('vaccineName', { required: 'Required' })} className={`input ${errors.vaccineName ? 'input-error' : ''}`} placeholder="Hepatitis B" />
            </FormField>
            <FormField label="Vaccine Type">
              <input {...register('vaccineType')} className="input" placeholder="Inactivated / Live" />
            </FormField>
            <FormField label="Dose Number">
              <input {...register('doseNumber')} className="input" placeholder="Dose 1 / Dose 2 / Booster" />
            </FormField>
            <FormField label="Administered By">
              <input {...register('administeredBy')} className="input" placeholder="Dr. Sharma" />
            </FormField>
            <FormField label="Administered Date">
              <input {...register('administeredDate')} type="date" className="input" />
            </FormField>
            <FormField label="Due Date">
              <input {...register('dueDate')} type="date" className="input" />
            </FormField>
            <FormField label="Next Due Date">
              <input {...register('nextDueDate')} type="date" className="input" />
            </FormField>
            <FormField label="Batch Number">
              <input {...register('batchNumber')} className="input" placeholder="VAC-BATCH-001" />
            </FormField>
          </div>
          <FormField label="Notes">
            <textarea {...register('notes')} className="input min-h-[60px]" placeholder="Any adverse reactions, observations…" />
          </FormField>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('completed')} type="checkbox" className="w-4 h-4 accent-primary-600" />
            <span className="text-sm text-gray-700">Mark as completed</span>
          </label>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={saveMut.isPending}>
              {saveMut.isPending ? 'Saving…' : editItem ? 'Update Record' : 'Save Record'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        title="Delete Vaccination Record"
        message="Are you sure you want to delete this vaccination record?"
        confirmLabel="Delete"
      />
    </div>
  )
}
