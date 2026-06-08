import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { visitApi, doctorApi, medicineApi } from '../../api'
import { PageHeader, VisitStatusBadge, FormField, Spinner, Modal } from '../../components/ui'
import { ArrowLeft, Plus, Trash2, CheckCircle, XCircle, Pill, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import type { OpdVisit, Prescription, PrescriptionItem } from '../../types'

export default function VisitDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const visitId = Number(id)
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false)

  const { data: visit, isLoading } = useQuery({
    queryKey: ['visit', id],
    queryFn: () => visitApi.getById(visitId).then(r => r.data.data),
  })

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorApi.getAll().then(r => r.data.data),
  })

  const { data: medicines } = useQuery({
    queryKey: ['medicines-active'],
    queryFn: () => medicineApi.getAllActive().then(r => r.data.data),
  })

  // Update visit form
  const { register: regVisit, handleSubmit: hsVisit } = useForm<Partial<OpdVisit>>({
    values: visit ?? {},
  })

  const updateMut = useMutation({
    mutationFn: (data: Partial<OpdVisit>) => visitApi.update(visitId, data).then(r => r.data.data),
    onSuccess: () => { toast.success('Visit updated'); qc.invalidateQueries({ queryKey: ['visit', id] }) },
    onError: () => toast.error('Update failed'),
  })

  // Prescription form
  const { register: regRx, handleSubmit: hsRx, control, watch: watchRx } = useForm<Prescription>({
    defaultValues: { items: [{ medicineId: 0, quantity: 1 }] }
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const prescribeMut = useMutation({
    mutationFn: (data: Prescription) => visitApi.addPrescription(visitId, data).then(r => r.data.data),
    onSuccess: () => {
      toast.success('Prescription added')
      qc.invalidateQueries({ queryKey: ['visit', id] })
      setShowPrescriptionForm(false)
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to add prescription'),
  })

  const dispenseMut = useMutation({
    mutationFn: () => visitApi.dispense(visitId).then(r => r.data.data),
    onSuccess: () => { toast.success('Medicines dispensed, inventory updated'); qc.invalidateQueries({ queryKey: ['visit', id] }) },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Dispense failed'),
  })

  const closeMut = useMutation({
    mutationFn: () => visitApi.close(visitId).then(r => r.data.data),
    onSuccess: () => { toast.success('Visit closed'); qc.invalidateQueries({ queryKey: ['visit', id] }) },
  })

  if (isLoading) return <Spinner className="h-64" />
  if (!visit) return <div className="text-center py-12 text-gray-400">Visit not found</div>

  const isClosed = visit.status === 'CLOSED'
  const fmtDt = (d?: string) => d ? format(new Date(d), 'dd MMM yyyy HH:mm') : '—'

  return (
    <div>
      <PageHeader
        title={`Visit: ${visit.visitNumber}`}
        subtitle={`${visit.employeeName} · ${visit.employeeCode}`}
        actions={
          <div className="flex gap-2">
            <button className="btn-secondary btn-sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {!isClosed && visit.prescription?.dispensed && (
              <button className="btn-success btn-sm" onClick={() => closeMut.mutate()}>
                <CheckCircle className="w-4 h-4" /> Close Visit
              </button>
            )}
          </div>
        }
      />

      {/* Status Banner */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-xl border border-gray-200">
        <VisitStatusBadge status={visit.status} />
        <span className="text-xs text-gray-500">Registered: {fmtDt(visit.registrationTime)}</span>
        {visit.consultationTime && <span className="text-xs text-gray-500">Consultation: {fmtDt(visit.consultationTime)}</span>}
        {visit.closedTime && <span className="text-xs text-gray-500">Closed: {fmtDt(visit.closedTime)}</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Consultation Details */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />Consultation Details
            </h2>
          </div>
          <form onSubmit={hsVisit(d => updateMut.mutate(d))} className="card-body space-y-4">
            <FormField label="Assign Doctor">
              <select
                {...regVisit('doctorId', { setValueAs: v => v ? Number(v) : undefined })}
                className="input"
                disabled={isClosed}
              >
                <option value="">Select doctor</option>
                {(doctors ?? []).map(d => (
                  <option key={d.id} value={d.id}>{d.fullName}</option>
                ))}
              </select>
            </FormField>

            {/* Vital Signs */}
            <div className="grid grid-cols-3 gap-2">
              <FormField label="BP"><input {...regVisit('bloodPressure')} className="input" placeholder="120/80" disabled={isClosed} /></FormField>
              <FormField label="Pulse"><input {...regVisit('pulse')} className="input" placeholder="72 bpm" disabled={isClosed} /></FormField>
              <FormField label="Temp (°F)"><input {...regVisit('temperature')} className="input" placeholder="98.6" disabled={isClosed} /></FormField>
              <FormField label="Weight (kg)"><input {...regVisit('weight')} className="input" placeholder="70" disabled={isClosed} /></FormField>
              <FormField label="Height (cm)"><input {...regVisit('height')} className="input" placeholder="170" disabled={isClosed} /></FormField>
              <FormField label="SpO2 (%)"><input {...regVisit('spO2')} className="input" placeholder="98" disabled={isClosed} /></FormField>
            </div>

            <FormField label="Chief Complaint">
              <textarea {...regVisit('chiefComplaint')} className="input min-h-[60px]" disabled={isClosed} />
            </FormField>
            <FormField label="Diagnosis">
              <textarea {...regVisit('diagnosis')} className="input min-h-[60px]" disabled={isClosed} />
            </FormField>
            <FormField label="Treatment">
              <textarea {...regVisit('treatment')} className="input min-h-[60px]" disabled={isClosed} />
            </FormField>
            <FormField label="Remarks">
              <textarea {...regVisit('remarks')} className="input min-h-[50px]" disabled={isClosed} />
            </FormField>
            <FormField label="Follow-up Date">
              <input {...regVisit('followUpDate')} type="date" className="input" disabled={isClosed} />
            </FormField>

            {!isClosed && (
              <button type="submit" className="btn-primary" disabled={updateMut.isPending}>
                {updateMut.isPending ? 'Saving…' : 'Save Consultation'}
              </button>
            )}
          </form>
        </div>

        {/* Prescription */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Pill className="w-4 h-4" />Prescription
            </h2>
            {!isClosed && !visit.prescription?.dispensed && (
              <button className="btn-primary btn-sm" onClick={() => setShowPrescriptionForm(true)}>
                <Plus className="w-3 h-3" />{visit.prescription ? 'Edit Rx' : 'Add Rx'}
              </button>
            )}
          </div>
          <div className="card-body">
            {!visit.prescription ? (
              <div className="text-center py-8 text-gray-400 text-sm">No prescription yet</div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <span className={visit.prescription.dispensed ? 'badge-green' : 'badge-yellow'}>
                    {visit.prescription.dispensed ? '✓ Dispensed' : 'Pending Dispense'}
                  </span>
                  {visit.prescription.prescribedAt && (
                    <span className="text-xs text-gray-400">Prescribed: {fmtDt(visit.prescription.prescribedAt)}</span>
                  )}
                </div>

                <div className="space-y-2">
                  {(visit.prescription.items ?? []).map((item, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.medicineName}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} {item.dosage && `· ${item.dosage}`} {item.frequency && `· ${item.frequency}`} {item.duration && `for ${item.duration}`}
                          </p>
                          {item.instructions && <p className="text-xs text-blue-600 mt-0.5">{item.instructions}</p>}
                        </div>
                        {item.dispensed && <span className="badge-green text-xs">✓</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {visit.prescription.notes && (
                  <p className="mt-3 text-xs text-gray-500 italic">{visit.prescription.notes}</p>
                )}

                {!isClosed && !visit.prescription.dispensed && (
                  <button
                    className="btn-success w-full justify-center mt-4"
                    onClick={() => dispenseMut.mutate()}
                    disabled={dispenseMut.isPending}
                  >
                    {dispenseMut.isPending ? 'Processing…' : '💊 Dispense Medicines'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Form Modal */}
      <Modal isOpen={showPrescriptionForm} onClose={() => setShowPrescriptionForm(false)}
        title="Write Prescription" size="lg">
        <form onSubmit={hsRx(d => prescribeMut.mutate(d))} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">Medicines</label>
              <button type="button" className="btn-secondary btn-sm"
                onClick={() => append({ medicineId: 0, quantity: 1, dosage: '', frequency: '', duration: '', instructions: '' } as PrescriptionItem)}>
                <Plus className="w-3 h-3" /> Add Medicine
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <select
                        {...regRx(`items.${index}.medicineId`, { required: true, setValueAs: v => Number(v) })}
                        className="input"
                      >
                        <option value={0}>Select medicine…</option>
                        {(medicines ?? []).map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.currentStock} {m.unit} available)
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      {...regRx(`items.${index}.quantity`, { required: true, min: 1, setValueAs: v => Number(v) })}
                      type="number" placeholder="Qty" min={1}
                      className="input w-20"
                    />
                    <button type="button" onClick={() => remove(index)}
                      className="text-red-400 hover:text-red-600 p-2" disabled={fields.length === 1}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input {...regRx(`items.${index}.dosage`)} placeholder="Dosage (e.g. 500mg)" className="input" />
                    <input {...regRx(`items.${index}.frequency`)} placeholder="Frequency (e.g. TDS)" className="input" />
                    <input {...regRx(`items.${index}.duration`)} placeholder="Duration (e.g. 5 days)" className="input" />
                  </div>
                  <input {...regRx(`items.${index}.instructions`)} placeholder="Special instructions" className="input mt-2" />
                </div>
              ))}
            </div>
          </div>

          <FormField label="Prescription Notes">
            <textarea {...regRx('notes')} className="input min-h-[60px]" placeholder="Additional notes…" />
          </FormField>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={prescribeMut.isPending}>
              {prescribeMut.isPending ? 'Saving…' : 'Save Prescription'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowPrescriptionForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
