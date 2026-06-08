import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { firstAidApi, medicineApi } from '../../api'
import { PageHeader, Modal, FormField, Spinner, EmptyState } from '../../components/ui'
import { Plus, PackagePlus, MinusCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { FirstAidBox, FirstAidBoxItem } from '../../types'
import clsx from 'clsx'

export default function FirstAidBoxList() {
  const qc = useQueryClient()
  const [selectedBox, setSelectedBox] = useState<FirstAidBox | null>(null)
  const [showBoxForm, setShowBoxForm] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [showIssueModal, setShowIssueModal] = useState<FirstAidBoxItem | null>(null)
  const [issueQty, setIssueQty] = useState(1)

  const { data: boxes, isLoading } = useQuery({
    queryKey: ['first-aid-boxes'],
    queryFn: () => firstAidApi.getAll().then(r => r.data.data),
  })

  const { data: medicines } = useQuery({
    queryKey: ['medicines-active'],
    queryFn: () => medicineApi.getAllActive().then(r => r.data.data),
  })

  const { register: regBox, handleSubmit: hsBox, reset: resetBox, formState: { errors: errBox } } = useForm<Partial<FirstAidBox>>()
  const { register: regItem, handleSubmit: hsItem, reset: resetItem } = useForm<Partial<FirstAidBoxItem>>({
    defaultValues: { currentQuantity: 1, minimumQuantity: 1 }
  })

  const createBoxMut = useMutation({
    mutationFn: (d: Partial<FirstAidBox>) => firstAidApi.create(d).then(r => r.data.data),
    onSuccess: (box) => {
      toast.success('First Aid Box created')
      qc.invalidateQueries({ queryKey: ['first-aid-boxes'] })
      setShowBoxForm(false); resetBox()
      setSelectedBox(box)
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed'),
  })

  const addItemMut = useMutation({
    mutationFn: (d: Partial<FirstAidBoxItem>) => firstAidApi.addItem(selectedBox!.id, d).then(r => r.data.data),
    onSuccess: () => {
      toast.success('Item added to box')
      qc.invalidateQueries({ queryKey: ['first-aid-boxes'] })
      setShowAddItem(false); resetItem()
      // Refresh selected box
      firstAidApi.getById(selectedBox!.id).then(r => setSelectedBox(r.data.data))
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed'),
  })

  const issueMut = useMutation({
    mutationFn: ({ item, qty }: { item: FirstAidBoxItem; qty: number }) =>
      firstAidApi.issueItem(selectedBox!.id, item.id!, qty).then(r => r.data.data),
    onSuccess: () => {
      toast.success('Item issued')
      qc.invalidateQueries({ queryKey: ['first-aid-boxes'] })
      setShowIssueModal(null)
      firstAidApi.getById(selectedBox!.id).then(r => setSelectedBox(r.data.data))
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed'),
  })

  const selectBox = (box: FirstAidBox) => {
    firstAidApi.getById(box.id).then(r => setSelectedBox(r.data.data))
  }

  return (
    <div>
      <PageHeader
        title="First Aid Boxes"
        subtitle="Manage first aid box stock across locations"
        actions={
          <button className="btn-primary" onClick={() => setShowBoxForm(true)}>
            <Plus className="w-4 h-4" /> Add Box
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Box list */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700">All Boxes</h2>
            <span className="badge-blue">{boxes?.length ?? 0}</span>
          </div>
          {isLoading ? <Spinner className="h-32" /> : (
            <div className="divide-y divide-gray-50">
              {(boxes ?? []).length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">No first aid boxes registered</div>
              ) : (boxes ?? []).map(box => (
                <button
                  key={box.id}
                  onClick={() => selectBox(box)}
                  className={clsx(
                    'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors',
                    selectedBox?.id === box.id && 'bg-primary-50 border-l-2 border-l-primary-600'
                  )}
                >
                  <p className="text-sm font-medium text-gray-900">{box.boxCode}</p>
                  <p className="text-xs text-gray-500">{box.location}</p>
                  {box.department && <p className="text-xs text-gray-400">{box.department}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {box.items?.length ?? 0} medicine types
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Box detail */}
        <div className="card col-span-2">
          {!selectedBox ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              Select a First Aid Box to view its contents
            </div>
          ) : (
            <>
              <div className="card-header">
                <div>
                  <h2 className="text-sm font-semibold text-gray-700">{selectedBox.boxCode}</h2>
                  <p className="text-xs text-gray-400">{selectedBox.location} · {selectedBox.department}</p>
                </div>
                <button className="btn-primary btn-sm" onClick={() => setShowAddItem(true)}>
                  <PackagePlus className="w-4 h-4" /> Add Medicine
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">Medicine</th>
                      <th className="table-header">Current Qty</th>
                      <th className="table-header">Min Qty</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedBox.items ?? []).length === 0 ? (
                      <tr><td colSpan={5}>
                        <EmptyState message="No medicines in this box" />
                      </td></tr>
                    ) : (selectedBox.items ?? []).map(item => {
                      const low = item.currentQuantity <= (item.minimumQuantity ?? 1)
                      return (
                        <tr key={item.id} className={clsx('table-row', low && 'bg-yellow-50/40')}>
                          <td className="table-cell font-medium">{item.medicineName}</td>
                          <td className="table-cell">
                            <span className={clsx('font-bold', low ? 'text-red-600' : 'text-green-700')}>
                              {item.currentQuantity}
                            </span>
                          </td>
                          <td className="table-cell text-gray-500">{item.minimumQuantity ?? 1}</td>
                          <td className="table-cell">
                            <span className={low ? 'badge-red' : 'badge-green'}>
                              {low ? 'Low Stock' : 'OK'}
                            </span>
                          </td>
                          <td className="table-cell">
                            <button
                              className="btn-warning btn-sm"
                              onClick={() => { setShowIssueModal(item); setIssueQty(1) }}
                            >
                              <MinusCircle className="w-3 h-3" /> Issue
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Box Modal */}
      <Modal isOpen={showBoxForm} onClose={() => { setShowBoxForm(false); resetBox() }}
        title="Create First Aid Box" size="sm">
        <form onSubmit={hsBox(d => createBoxMut.mutate(d))} className="p-6 space-y-4">
          <FormField label="Box Code" required error={errBox.boxCode?.message}>
            <input {...regBox('boxCode', { required: 'Required' })} className="input" placeholder="FAB-001" />
          </FormField>
          <FormField label="Location" required error={errBox.location?.message}>
            <input {...regBox('location', { required: 'Required' })} className="input" placeholder="Gate 1 / Workshop A" />
          </FormField>
          <FormField label="Department">
            <input {...regBox('department')} className="input" placeholder="Production" />
          </FormField>
          <FormField label="Responsible Person">
            <input {...regBox('responsiblePerson')} className="input" placeholder="Safety Officer Name" />
          </FormField>
          <FormField label="Remarks">
            <textarea {...regBox('remarks')} className="input min-h-[60px]" />
          </FormField>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={createBoxMut.isPending}>
              {createBoxMut.isPending ? 'Creating…' : 'Create Box'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowBoxForm(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={showAddItem} onClose={() => { setShowAddItem(false); resetItem() }}
        title="Add Medicine to Box" size="sm">
        <form onSubmit={hsItem(d => addItemMut.mutate(d))} className="p-6 space-y-4">
          <FormField label="Medicine" required>
            <select {...regItem('medicineId', { required: true, setValueAs: v => Number(v) })} className="input">
              <option value={0}>Select medicine…</option>
              {(medicines ?? []).map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} — Stock: {m.currentStock} {m.unit}
                </option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Quantity to Add">
              <input
                {...regItem('currentQuantity', { required: true, valueAsNumber: true, min: 1 })}
                type="number" min={1} className="input"
              />
            </FormField>
            <FormField label="Minimum Quantity">
              <input
                {...regItem('minimumQuantity', { valueAsNumber: true, min: 1 })}
                type="number" min={1} className="input"
              />
            </FormField>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={addItemMut.isPending}>
              {addItemMut.isPending ? 'Adding…' : 'Add to Box'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowAddItem(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Issue Modal */}
      <Modal isOpen={!!showIssueModal} onClose={() => setShowIssueModal(null)}
        title="Issue from First Aid Box" size="sm">
        {showIssueModal && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              Issuing: <strong>{showIssueModal.medicineName}</strong><br />
              Available: <strong>{showIssueModal.currentQuantity}</strong>
            </p>
            <FormField label="Quantity to Issue">
              <input
                type="number" min={1} max={showIssueModal.currentQuantity}
                value={issueQty}
                onChange={e => setIssueQty(Number(e.target.value))}
                className="input"
              />
            </FormField>
            <div className="flex gap-3">
              <button
                className="btn-warning flex-1 justify-center"
                onClick={() => issueMut.mutate({ item: showIssueModal, qty: issueQty })}
                disabled={issueMut.isPending}
              >
                {issueMut.isPending ? 'Issuing…' : 'Issue'}
              </button>
              <button className="btn-secondary" onClick={() => setShowIssueModal(null)}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
