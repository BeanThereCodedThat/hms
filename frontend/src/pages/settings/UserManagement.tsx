import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { userApi } from '../../api'
import { PageHeader, Modal, FormField, Spinner, EmptyState } from '../../components/ui'
import { Plus, Edit, ToggleLeft, ToggleRight, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import type { User } from '../../types'
import clsx from 'clsx'

const ROLE_COLORS: Record<string, string> = {
  ADMIN:       'badge-red',
  DOCTOR:      'badge-blue',
  PHARMACIST:  'badge-green',
  OPD_STAFF:   'badge-yellow',
}

export default function UserManagement() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll().then(r => r.data.data),
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Partial<User> & { password?: string }>()

  const saveMut = useMutation({
    mutationFn: (data: any) =>
      editUser
        ? userApi.update(editUser.id, data).then(r => r.data.data)
        : userApi.create(data).then(r => r.data.data),
    onSuccess: () => {
      toast.success(editUser ? 'User updated' : 'User created')
      qc.invalidateQueries({ queryKey: ['users'] })
      setShowForm(false); setEditUser(null); reset()
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Save failed'),
  })

  const toggleMut = useMutation({
    mutationFn: (id: number) => userApi.toggleActive(id),
    onSuccess: () => { toast.success('User status changed'); qc.invalidateQueries({ queryKey: ['users'] }) },
  })

  const openEdit = (u: User) => {
    setEditUser(u)
    setValue('fullName', u.fullName)
    setValue('email', u.email)
    setValue('role', u.role)
    setValue('active', u.active)
    setShowForm(true)
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage system users and their access roles"
        actions={
          <button className="btn-primary" onClick={() => { setEditUser(null); reset(); setShowForm(true) }}>
            <Plus className="w-4 h-4" /> Add User
          </button>
        }
      />

      {/* Role summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {['ADMIN', 'DOCTOR', 'PHARMACIST', 'OPD_STAFF'].map(role => {
          const count = (users ?? []).filter(u => u.role === role && u.active).length
          return (
            <div key={role} className="card p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{role.replace('_', ' ')}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card">
        {isLoading ? (
          <Spinner className="h-48" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Username</th>
                  <th className="table-header">Full Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(users ?? []).length === 0 ? (
                  <tr><td colSpan={6}>
                    <EmptyState message="No users found" />
                  </td></tr>
                ) : (users ?? []).map(u => (
                  <tr key={u.id} className={clsx('table-row', !u.active && 'opacity-60')}>
                    <td className="table-cell font-mono text-sm font-medium text-primary-700">{u.username}</td>
                    <td className="table-cell font-medium">{u.fullName}</td>
                    <td className="table-cell text-gray-500">{u.email ?? '—'}</td>
                    <td className="table-cell">
                      <span className={ROLE_COLORS[u.role] ?? 'badge-gray'}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={u.active ? 'badge-green' : 'badge-gray'}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button className="btn-secondary btn-sm" onClick={() => openEdit(u)} title="Edit">
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          className={clsx('btn-sm', u.active ? 'btn-warning' : 'btn-success')}
                          onClick={() => toggleMut.mutate(u.id)}
                          title={u.active ? 'Deactivate' : 'Activate'}
                        >
                          {u.active ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
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

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditUser(null); reset() }}
        title={editUser ? 'Edit User' : 'Create New User'} size="sm">
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="p-6 space-y-4">
          {!editUser && (
            <FormField label="Username" required error={errors.username?.message}>
              <input
                {...register('username', { required: 'Username is required' })}
                className={`input ${errors.username ? 'input-error' : ''}`}
                placeholder="john.doe"
              />
            </FormField>
          )}
          <FormField label="Full Name" required error={errors.fullName?.message}>
            <input
              {...register('fullName', { required: 'Full name is required' })}
              className={`input ${errors.fullName ? 'input-error' : ''}`}
              placeholder="John Doe"
            />
          </FormField>
          <FormField label="Email">
            <input {...register('email')} type="email" className="input" placeholder="john.doe@company.com" />
          </FormField>
          <FormField label="Role" required>
            <select {...register('role', { required: true })} className="input">
              <option value="">Select role…</option>
              <option value="ADMIN">Admin</option>
              <option value="DOCTOR">Doctor</option>
              <option value="PHARMACIST">Pharmacist</option>
              <option value="OPD_STAFF">OPD Staff</option>
            </select>
          </FormField>
          <FormField label={editUser ? 'New Password (leave blank to keep)' : 'Password'} error={errors.password?.message}>
            <input
              {...register('password', { required: !editUser ? 'Password is required' : false, minLength: { value: 6, message: 'Minimum 6 characters' } })}
              type="password"
              className={`input ${errors.password ? 'input-error' : ''}`}
              placeholder={editUser ? 'Leave blank to keep current' : 'Min 6 characters'}
            />
          </FormField>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={saveMut.isPending}>
              {saveMut.isPending ? 'Saving…' : editUser ? 'Update User' : 'Create User'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
