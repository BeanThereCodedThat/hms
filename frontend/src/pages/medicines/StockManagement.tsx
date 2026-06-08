import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { medicineApi } from '../../api'
import { PageHeader, FormField, Spinner, Modal } from '../../components/ui'
import { ArrowDownCircle, ArrowUpCircle, Trash2, RefreshCw, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import type { StockTransaction } from '../../types'
import clsx from 'clsx'

const TX_TYPES = [
  { value: 'INWARD',     label: 'Stock Inward',   icon: <ArrowDownCircle className="w-4 h-4" />, color: 'text-green-600' },
  { value: 'ISSUE',      label: 'Stock Issue',    icon: <ArrowUpCircle className="w-4 h-4" />,   color: 'text-blue-600' },
  { value: 'DISCARD',    label: 'Discard',        icon: <Trash2 className="w-4 h-4" />,           color: 'text-red-600' },
  { value: 'ADJUSTMENT', label: 'Adjustment',     icon: <RefreshCw className="w-4 h-4" />,        color: 'text-purple-600' },
]

export default function StockManagement() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [selectedMedId, setSelectedMedId] = useState<number | null>(null)

  const { data: medicines } = useQuery({
    queryKey: ['medicines-active'],
    queryFn: () => medicineApi.getAllActive().then(r => r.data.data),
  })

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', selectedMedId],
    queryFn: () => selectedMedId
      ? medicineApi.getTransactions(selectedMedId).then(r => r.data.data)
      : Promise.resolve([]),
    enabled: !!selectedMedId,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<StockTransaction>>({
    defaultValues: { transactionType: 'INWARD', quantity: 1 }
  })

  const txMut = useMutation({
    mutationFn: (data: Partial<StockTransaction>) =>
      medicineApi.addTransaction(data).then(r => r.data.data),
    onSuccess: (tx) => {
      toast.success(`${tx.transactionType} recorded. Balance: ${tx.balanceAfter}`)
      qc.invalidateQueries({ queryKey: ['medicines'] })
      qc.invalidateQueries({ queryKey: ['transactions', selectedMedId] })
      setShowForm(false)
      reset()
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Transaction failed'),
  })

  const selectedMed = medicines?.find(m => m.id === selectedMedId)

  const txColor = (type: string) => ({
    INWARD:       'text-green-600 bg-green-50',
    ISSUE:        'text-blue-600 bg-blue-50',
    DISCARD:      'text-red-600 bg-red-50',
    ADJUSTMENT:   'text-purple-600 bg-purple-50',
    FIRST_AID_ISSUE: 'text-yellow-600 bg-yellow-50',
  }[type] ?? 'text-gray-600 bg-gray-50')

  return (
    <div>
      <PageHeader
        title="Stock Management"
        subtitle="Record inward, issue, and discard transactions"
        actions={
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Record Transaction
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Medicine selector */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700">Select Medicine</h2>
          </div>
          <div className="card-body p-2 max-h-[500px] overflow-y-auto">
            {(medicines ?? []).map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMedId(m.id)}
                className={clsx(
                  'w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all',
                  selectedMedId === m.id
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-gray-50'
                )}
              >
                <div className={clsx('text-sm font-medium', selectedMedId === m.id ? 'text-white' : 'text-gray-900')}>
                  {m.name}
                </div>
                <div className={clsx('text-xs', selectedMedId === m.id ? 'text-primary-100' : 'text-gray-400')}>
                  Stock: {m.currentStock} {m.unit}
                  {m.stockStatus !== 'HEALTHY' && (
                    <span className={clsx('ml-2', m.stockStatus === 'EXPIRED' ? 'text-red-300' : 'text-yellow-300')}>
                      ⚠ {m.stockStatus}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Transaction history */}
        <div className="card col-span-2">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700">
              {selectedMed ? `${selectedMed.name} — Transaction History` : 'Select a medicine to view history'}
            </h2>
            {selectedMed && (
              <div className="flex items-center gap-2">
                <span className={clsx(
                  'font-bold text-sm',
                  selectedMed.statusColor === 'red' ? 'text-red-600' :
                  selectedMed.statusColor === 'yellow' ? 'text-yellow-700' : 'text-green-700'
                )}>
                  Stock: {selectedMed.currentStock} {selectedMed.unit}
                </span>
              </div>
            )}
          </div>

          {!selectedMedId ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              Select a medicine from the list to view transaction history
            </div>
          ) : isLoading ? (
            <Spinner className="h-48" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">Date & Time</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Quantity</th>
                    <th className="table-header">Balance After</th>
                    <th className="table-header">Batch</th>
                    <th className="table-header">Remarks</th>
                    <th className="table-header">By</th>
                  </tr>
                </thead>
                <tbody>
                  {(transactions ?? []).length === 0 ? (
                    <tr><td colSpan={7} className="table-cell text-center text-gray-400 py-8">No transactions recorded</td></tr>
                  ) : (transactions ?? []).map(tx => (
                    <tr key={tx.id} className="table-row">
                      <td className="table-cell text-xs">
                        {tx.transactionDate ? format(new Date(tx.transactionDate), 'dd MMM yyyy HH:mm') : '—'}
                      </td>
                      <td className="table-cell">
                        <span className={clsx('badge text-xs', txColor(tx.transactionType))}>
                          {tx.transactionType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="table-cell font-bold">
                        <span className={
                          tx.transactionType === 'INWARD' ? 'text-green-600' :
                          ['ISSUE','DISCARD','FIRST_AID_ISSUE'].includes(tx.transactionType) ? 'text-red-600' : 'text-purple-600'
                        }>
                          {['INWARD'].includes(tx.transactionType) ? '+' : '-'}{tx.quantity}
                        </span>
                      </td>
                      <td className="table-cell font-medium">{tx.balanceAfter ?? '—'}</td>
                      <td className="table-cell text-xs text-gray-500">{tx.batchNumber ?? '—'}</td>
                      <td className="table-cell text-xs text-gray-500 max-w-[150px] truncate">{tx.remarks ?? '—'}</td>
                      <td className="table-cell text-xs text-gray-400">{tx.createdBy ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Form Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); reset() }}
        title="Record Stock Transaction" size="md">
        <form onSubmit={handleSubmit(d => txMut.mutate(d))} className="p-6 space-y-4">
          <FormField label="Medicine" required>
            <select
              {...register('medicineId', { required: true, setValueAs: v => Number(v) })}
              className="input"
            >
              <option value={0}>Select medicine…</option>
              {(medicines ?? []).map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} — Stock: {m.currentStock} {m.unit}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Transaction Type" required>
            <div className="grid grid-cols-2 gap-2">
              {TX_TYPES.map(t => (
                <label key={t.value} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-primary-400 has-[:checked]:bg-primary-50">
                  <input
                    {...register('transactionType', { required: true })}
                    type="radio"
                    value={t.value}
                    className="accent-primary-600"
                  />
                  <span className={clsx('flex items-center gap-1.5 text-sm font-medium', t.color)}>
                    {t.icon}{t.label}
                  </span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Quantity" required error={errors.quantity?.message}>
            <input
              {...register('quantity', { required: true, valueAsNumber: true, min: { value: 1, message: 'Min 1' } })}
              type="number" min={1} className={`input ${errors.quantity ? 'input-error' : ''}`}
              placeholder="Enter quantity"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Batch Number">
              <input {...register('batchNumber')} className="input" placeholder="BATCH-2024-001" />
            </FormField>
            <FormField label="Expiry Date">
              <input {...register('expiryDate')} type="date" className="input" />
            </FormField>
          </div>

          <FormField label="Remarks">
            <textarea {...register('remarks')} className="input min-h-[60px]"
              placeholder="Supplier name, reason for discard, etc." />
          </FormField>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={txMut.isPending}>
              {txMut.isPending ? 'Recording…' : 'Record Transaction'}
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
