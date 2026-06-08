import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeApi } from '../../api'
import { PageHeader, FormField, Spinner } from '../../components/ui'
import toast from 'react-hot-toast'
import type { Employee } from '../../types'

export default function EmployeeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = !!id

  const { data: existing, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeApi.getById(Number(id)).then(r => r.data.data),
    enabled: isEdit,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Employee>>()

  useEffect(() => {
    if (existing) reset(existing)
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: (data: Partial<Employee>) =>
      isEdit
        ? employeeApi.update(Number(id), data).then(r => r.data.data)
        : employeeApi.create(data).then(r => r.data.data),
    onSuccess: (emp) => {
      toast.success(isEdit ? 'Employee updated' : 'Employee created')
      qc.invalidateQueries({ queryKey: ['employees'] })
      navigate(`/employees/${emp.id}`)
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Save failed'),
  })

  if (isEdit && isLoading) return <Spinner className="h-64" />

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Employee' : 'New Employee'}
        subtitle={isEdit ? `Editing: ${existing?.fullName}` : 'Register a new employee'}
      />

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="max-w-3xl">
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700">Personal Information</h2>
          </div>
          <div className="card-body grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Employee Code" required error={errors.employeeCode?.message}>
              <input
                {...register('employeeCode', { required: 'Employee code is required' })}
                className={`input ${errors.employeeCode ? 'input-error' : ''}`}
                placeholder="EMP-001"
                disabled={isEdit}
              />
            </FormField>
            <FormField label="First Name" required error={errors.firstName?.message}>
              <input
                {...register('firstName', { required: 'First name is required' })}
                className={`input ${errors.firstName ? 'input-error' : ''}`}
                placeholder="John"
              />
            </FormField>
            <FormField label="Last Name" required error={errors.lastName?.message}>
              <input
                {...register('lastName', { required: 'Last name is required' })}
                className={`input ${errors.lastName ? 'input-error' : ''}`}
                placeholder="Doe"
              />
            </FormField>
            <FormField label="Gender">
              <select {...register('gender')} className="input">
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </FormField>
            <FormField label="Date of Birth">
              <input {...register('dateOfBirth')} type="date" className="input" />
            </FormField>
            <FormField label="Blood Group">
              <select {...register('bloodGroup')} className="input">
                <option value="">Select</option>
                {['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG'].map(bg => (
                  <option key={bg} value={bg}>{bg.replace('_', ' ')}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Contact Number">
              <input {...register('contactNumber')} className="input" placeholder="+91 98765 43210" />
            </FormField>
            <FormField label="Email">
              <input {...register('email')} type="email" className="input" placeholder="john.doe@company.com" />
            </FormField>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700">Employment Details</h2>
          </div>
          <div className="card-body grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Department">
              <input {...register('department')} className="input" placeholder="Engineering" />
            </FormField>
            <FormField label="Designation">
              <input {...register('designation')} className="input" placeholder="Senior Engineer" />
            </FormField>
            <FormField label="Joining Date">
              <input {...register('joiningDate')} type="date" className="input" />
            </FormField>
            <FormField label="Smart Card ID">
              <input {...register('smartCardId')} className="input" placeholder="SC-001" />
            </FormField>
            <FormField label="Address" >
              <input {...register('address')} className="input" placeholder="Address" />
            </FormField>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700">Medical Information</h2>
          </div>
          <div className="card-body grid grid-cols-1 gap-4">
            <FormField label="Medical History">
              <textarea {...register('medicalHistory')} className="input min-h-[80px]" placeholder="Known conditions, past surgeries…" />
            </FormField>
            <FormField label="Allergies">
              <textarea {...register('allergies')} className="input min-h-[60px]" placeholder="Drug allergies, food allergies…" />
            </FormField>
            <FormField label="Chronic Conditions">
              <textarea {...register('chronicConditions')} className="input min-h-[60px]" placeholder="Diabetes, hypertension…" />
            </FormField>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Update Employee' : 'Create Employee'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
