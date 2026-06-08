import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { medicineApi } from '../../api'
import { PageHeader, FormField, Spinner } from '../../components/ui'
import toast from 'react-hot-toast'
import type { Medicine } from '../../types'

export default function MedicineForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = !!id

  const { data: existing, isLoading } = useQuery({
    queryKey: ['medicine', id],
    queryFn: () => medicineApi.getById(Number(id)).then(r => r.data.data),
    enabled: isEdit,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Medicine>>({
    defaultValues: { minStockLevel: 10, criticalStockLevel: 5, currentStock: 0 }
  })

  useEffect(() => { if (existing) reset(existing) }, [existing, reset])

  const mutation = useMutation({
    mutationFn: (data: Partial<Medicine>) =>
      isEdit
        ? medicineApi.update(Number(id), data).then(r => r.data.data)
        : medicineApi.create(data).then(r => r.data.data),
    onSuccess: () => {
      toast.success(isEdit ? 'Medicine updated' : 'Medicine created')
      qc.invalidateQueries({ queryKey: ['medicines'] })
      navigate('/medicines')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Save failed'),
  })

  if (isEdit && isLoading) return <Spinner className="h-64" />

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Medicine' : 'Add Medicine'}
        subtitle={isEdit ? `Editing: ${existing?.name}` : 'Register a new medicine'}
      />

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="max-w-3xl space-y-4">
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700">Medicine Details</h2>
          </div>
          <div className="card-body grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Medicine Code" required error={errors.medicineCode?.message}>
              <input
                {...register('medicineCode', { required: 'Code is required' })}
                className={`input ${errors.medicineCode ? 'input-error' : ''}`}
                placeholder="MED-001"
                disabled={isEdit}
              />
            </FormField>
            <FormField label="Medicine Name" required error={errors.name?.message}>
              <input
                {...register('name', { required: 'Name is required' })}
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="Paracetamol"
              />
            </FormField>
            <FormField label="Generic Name">
              <input {...register('genericName')} className="input" placeholder="Acetaminophen" />
            </FormField>
            <FormField label="Category">
              <input {...register('category')} className="input" placeholder="Analgesic / Antipyretic" />
            </FormField>
            <FormField label="Strength / Dosage Form">
              <input {...register('strength')} className="input" placeholder="500mg Tablet" />
            </FormField>
            <FormField label="Unit">
              <input {...register('unit')} className="input" placeholder="Tablets / Capsules / mL" />
            </FormField>
            <FormField label="Manufacturer">
              <input {...register('manufacturer')} className="input" placeholder="Cipla Ltd." />
            </FormField>
            <FormField label="Storage Location">
              <input {...register('storageLocation')} className="input" placeholder="Shelf A-3" />
            </FormField>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700">Stock & Expiry</h2>
          </div>
          <div className="card-body grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Current Stock">
              <input
                {...register('currentStock', { valueAsNumber: true, min: 0 })}
                type="number" min={0} className="input"
                placeholder="0"
              />
            </FormField>
            <FormField label="Min Stock Level" hint="Alert threshold">
              <input
                {...register('minStockLevel', { valueAsNumber: true, min: 0 })}
                type="number" min={0} className="input"
              />
            </FormField>
            <FormField label="Critical Stock Level" hint="Critical alert">
              <input
                {...register('criticalStockLevel', { valueAsNumber: true, min: 0 })}
                type="number" min={0} className="input"
              />
            </FormField>
            <FormField label="Batch Number">
              <input {...register('batchNumber')} className="input" placeholder="BATCH-2024-001" />
            </FormField>
            <FormField label="Expiry Date">
              <input {...register('expiryDate')} type="date" className="input" />
            </FormField>
            <FormField label="Unit Price (₹)">
              <input
                {...register('unitPrice', { valueAsNumber: true })}
                type="number" step="0.01" min={0} className="input"
                placeholder="0.00"
              />
            </FormField>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700">Additional Info</h2>
          </div>
          <div className="card-body">
            <FormField label="Description / Notes">
              <textarea {...register('description')} className="input min-h-[80px]"
                placeholder="Usage instructions, contraindications, storage notes…" />
            </FormField>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Update Medicine' : 'Add Medicine'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
