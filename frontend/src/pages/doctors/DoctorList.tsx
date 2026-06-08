import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { doctorApi } from '../../api'
import { PageHeader, DoctorStatusBadge, Modal, FormField, Spinner, EmptyState, ConfirmDialog } from '../../components/ui'
import { Plus, Edit, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Doctor, DoctorStatus } from '../../types'
import { useAuth } from '../../context/AuthContext'

export default function DoctorList() {
  const qc = useQueryClient()
  const { hasRole } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editDoc, setEditDoc] = useState<Doctor | null>(null)

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorApi.getAll().then(r => r.data.data),
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Partial<Doctor>>()

  const saveMut = useMutation({
    mutationFn: (data: Partial<Doctor>) =>
      editDoc
        ? doctorApi.update(editDoc.id, data).then(r => r.data.data)
        : doctorApi.create(data).then(r => r.data.data),
    onSuccess: () => {
      toast.success(editDoc ? 'Doctor updated' : 'Doctor created')
      qc.invalidateQueries({ queryKey: ['doctors'] })
      setShowForm(false)
      setEditDoc(null)
      reset()
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Save failed'),
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: DoctorStatus }) =>
      doctorApi.updateStatus(id, status).then(r => r.data.data),
    onSuccess: () => {
      toast.success('Status updated')
      qc.invalidateQueries({ queryKey: ['doctors'] })
    },
  })

  const openEdit = (doc: Doctor) => {
    setEditDoc(doc)
    setValue('firstName', doc.firstName)
    setValue('lastName', doc.lastName)
    setValue('specialization', doc.specialization)
    setValue('qualification', doc.qualification)
    setValue('registrationNumber', doc.registrationNumber)
    setValue('contactNumber', doc.contactNumber)
    setValue('email', doc.email)
    setValue('currentShift', doc.currentShift)
    setShowForm(true)
  }

  return (
    <div>
      <PageHeader
        title="Doctors"
        subtitle={`${doctors?.length ?? 0} doctors registered`}
        actions={
          hasRole('ADMIN') ? (
            <button className="btn-primary" onClick={() => { setEditDoc(null); reset(); setShowForm(true) }}>
              <Plus className="w-4 h-4" /> Add Doctor
            </button>
          ) : undefined
        }
      />

      <div className="card">
        {isLoading ? (
          <Spinner className="h-48" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Code</th>
                  <th className="table-header">Doctor</th>
                  <th className="table-header">Specialization</th>
                  <th className="table-header">Qualification</th>
                  <th className="table-header">Shift</th>
                  <th className="table-header">Status</th>
                  {hasRole('ADMIN', 'DOCTOR') && <th className="table-header">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {(doctors ?? []).length === 0 ? (
                  <tr><td colSpan={7}>
                    <EmptyState icon={<UserCheck className="w-10 h-10" />} message="No doctors registered" />
                  </td></tr>
                ) : (doctors ?? []).map(doc => (
                  <tr key={doc.id} className="table-row">
                    <td className="table-cell font-mono text-xs text-primary-700">{doc.doctorCode}</td>
                    <td className="table-cell">
                      <div className="font-medium">{doc.fullName}</div>
                      <div className="text-xs text-gray-400">{doc.contactNumber}</div>
                    </td>
                    <td className="table-cell">{doc.specialization ?? '—'}</td>
                    <td className="table-cell">{doc.qualification ?? '—'}</td>
                    <td className="table-cell">{doc.currentShift ?? '—'}</td>
                    <td className="table-cell">
                      {hasRole('ADMIN', 'DOCTOR') ? (
                        <select
                          value={doc.status}
                          onChange={e => statusMut.mutate({ id: doc.id, status: e.target.value as DoctorStatus })}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white cursor-pointer"
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="UNAVAILABLE">Unavailable</option>
                          <option value="ON_LEAVE">On Leave</option>
                          <option value="ASSIGNED">Assigned</option>
                        </select>
                      ) : (
                        <DoctorStatusBadge status={doc.status} />
                      )}
                    </td>
                    {hasRole('ADMIN', 'DOCTOR') && (
                      <td className="table-cell">
                        <button className="btn-secondary btn-sm" onClick={() => openEdit(doc)}>
                          <Edit className="w-3 h-3" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditDoc(null); reset() }}
        title={editDoc ? 'Edit Doctor' : 'Add Doctor'} size="md">
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!editDoc && (
              <FormField label="Doctor Code" required error={errors.doctorCode?.message}>
                <input
                  {...register('doctorCode', { required: 'Code required' })}
                  className={`input ${errors.doctorCode ? 'input-error' : ''}`}
                  placeholder="DOC-001"
                />
              </FormField>
            )}
            <FormField label="First Name" required error={errors.firstName?.message}>
              <input
                {...register('firstName', { required: 'First name required' })}
                className={`input ${errors.firstName ? 'input-error' : ''}`}
                placeholder="Rahul"
              />
            </FormField>
            <FormField label="Last Name" required error={errors.lastName?.message}>
              <input
                {...register('lastName', { required: 'Last name required' })}
                className={`input ${errors.lastName ? 'input-error' : ''}`}
                placeholder="Sharma"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Specialization">
              <input {...register('specialization')} className="input" placeholder="Occupational Medicine" />
            </FormField>
            <FormField label="Qualification">
              <input {...register('qualification')} className="input" placeholder="MBBS, MD" />
            </FormField>
            <FormField label="Registration No.">
              <input {...register('registrationNumber')} className="input" placeholder="MCI-12345" />
            </FormField>
            <FormField label="Contact">
              <input {...register('contactNumber')} className="input" placeholder="+91 98765 43210" />
            </FormField>
            <FormField label="Email">
              <input {...register('email')} type="email" className="input" placeholder="doctor@company.com" />
            </FormField>
            <FormField label="Current Shift">
              <select {...register('currentShift')} className="input">
                <option value="">Select shift</option>
                <option value="Morning">Morning (6AM–2PM)</option>
                <option value="Afternoon">Afternoon (2PM–10PM)</option>
                <option value="Night">Night (10PM–6AM)</option>
                <option value="General">General (9AM–5PM)</option>
              </select>
            </FormField>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={saveMut.isPending}>
              {saveMut.isPending ? 'Saving…' : editDoc ? 'Update Doctor' : 'Add Doctor'}
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
