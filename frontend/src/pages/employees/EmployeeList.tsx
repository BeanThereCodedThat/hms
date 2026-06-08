import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeApi } from '../../api'
import { PageHeader, SearchInput, Spinner, EmptyState, Pagination, ConfirmDialog } from '../../components/ui'
import { Plus, Eye, Edit, UserX, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function EmployeeList() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { hasRole } = useAuth()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [deactivateId, setDeactivateId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['employees', search, page],
    queryFn: () => employeeApi.getAll(search, page, 20).then(r => r.data.data),
  })

  const deactivateMut = useMutation({
    mutationFn: (id: number) => employeeApi.deactivate(id),
    onSuccess: () => {
      toast.success('Employee deactivated')
      qc.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: () => toast.error('Failed to deactivate employee'),
  })

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${data?.totalElements ?? 0} total employees`}
        actions={
          hasRole('ADMIN', 'OPD_STAFF') ? (
            <button className="btn-primary" onClick={() => navigate('/employees/new')}>
              <Plus className="w-4 h-4" /> New Employee
            </button>
          ) : undefined
        }
      />

      <div className="card">
        <div className="card-header gap-3">
          <SearchInput
            value={search}
            onChange={v => { setSearch(v); setPage(0) }}
            placeholder="Search by name, code, department…"
          />
        </div>

        {isLoading ? (
          <Spinner className="h-48" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">Emp. Code</th>
                    <th className="table-header">Name</th>
                    <th className="table-header">Department</th>
                    <th className="table-header">Designation</th>
                    <th className="table-header">Contact</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.content ?? []).length === 0 ? (
                    <tr><td colSpan={7}><EmptyState icon={<Users className="w-10 h-10" />} message="No employees found" /></td></tr>
                  ) : (
                    (data?.content ?? []).map(emp => (
                      <tr key={emp.id} className="table-row">
                        <td className="table-cell font-mono text-xs font-medium text-primary-700">{emp.employeeCode}</td>
                        <td className="table-cell">
                          <div className="font-medium text-gray-900">{emp.fullName}</div>
                          {emp.email && <div className="text-xs text-gray-400">{emp.email}</div>}
                        </td>
                        <td className="table-cell">{emp.department ?? '—'}</td>
                        <td className="table-cell">{emp.designation ?? '—'}</td>
                        <td className="table-cell">{emp.contactNumber ?? '—'}</td>
                        <td className="table-cell">
                          <span className={emp.active ? 'badge-green' : 'badge-red'}>
                            {emp.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex gap-1">
                            <button
                              className="btn-secondary btn-sm"
                              onClick={() => navigate(`/employees/${emp.id}`)}
                              title="View"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            {hasRole('ADMIN', 'OPD_STAFF') && (
                              <button
                                className="btn-secondary btn-sm"
                                onClick={() => navigate(`/employees/${emp.id}/edit`)}
                                title="Edit"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            )}
                            {hasRole('ADMIN') && emp.active && (
                              <button
                                className="btn-danger btn-sm"
                                onClick={() => setDeactivateId(emp.id)}
                                title="Deactivate"
                              >
                                <UserX className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 border-t border-gray-100">
              <Pagination
                page={page}
                totalPages={data?.totalPages ?? 0}
                totalElements={data?.totalElements ?? 0}
                size={20}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={deactivateId !== null}
        onClose={() => setDeactivateId(null)}
        onConfirm={() => deactivateId && deactivateMut.mutate(deactivateId)}
        title="Deactivate Employee"
        message="Are you sure you want to deactivate this employee? They will no longer appear in active lists."
        confirmLabel="Deactivate"
      />
    </div>
  )
}
