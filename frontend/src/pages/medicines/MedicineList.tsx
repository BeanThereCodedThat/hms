import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { medicineApi } from '../../api'
import { PageHeader, SearchInput, Spinner, EmptyState, Pagination, StockStatusBadge } from '../../components/ui'
import { Plus, Edit, Package, AlertTriangle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

type FilterTab = 'all' | 'low' | 'expiring' | 'expired'

export default function MedicineList() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [filterTab, setFilterTab] = useState<FilterTab>('all')

  const { data: allData, isLoading: loadingAll } = useQuery({
    queryKey: ['medicines', search, page],
    queryFn: () => medicineApi.getAll(search, page, 20).then(r => r.data.data),
    enabled: filterTab === 'all',
  })

  const { data: lowStock, isLoading: loadingLow } = useQuery({
    queryKey: ['medicines-low'],
    queryFn: () => medicineApi.getLowStock().then(r => r.data.data),
    enabled: filterTab === 'low',
  })

  const { data: expiring, isLoading: loadingExp } = useQuery({
    queryKey: ['medicines-expiring'],
    queryFn: () => medicineApi.getExpiring().then(r => r.data.data),
    enabled: filterTab === 'expiring',
  })

  const { data: expired, isLoading: loadingExpired } = useQuery({
    queryKey: ['medicines-expired'],
    queryFn: () => medicineApi.getExpired().then(r => r.data.data),
    enabled: filterTab === 'expired',
  })

  const isLoading = loadingAll || loadingLow || loadingExp || loadingExpired

  const medicines = filterTab === 'all'
    ? (allData?.content ?? [])
    : filterTab === 'low' ? (lowStock ?? [])
    : filterTab === 'expiring' ? (expiring ?? [])
    : (expired ?? [])

  const tabs: { key: FilterTab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'all',      label: 'All Medicines', icon: <Package className="w-3.5 h-3.5" />,      color: 'text-gray-600' },
    { key: 'low',      label: 'Low Stock',     icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-red-600' },
    { key: 'expiring', label: 'Expiring Soon', icon: <Clock className="w-3.5 h-3.5" />,         color: 'text-yellow-600' },
    { key: 'expired',  label: 'Expired',       icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-red-700' },
  ]

  const rowBg = (color: string) => ({
    green:  '',
    yellow: 'bg-yellow-50/40',
    red:    'bg-red-50/40',
  }[color] ?? '')

  return (
    <div>
      <PageHeader
        title="Medicine Inventory"
        subtitle={`${allData?.totalElements ?? 0} medicines registered`}
        actions={
          <div className="flex gap-2">
            {hasRole('ADMIN', 'PHARMACIST') && (
              <>
                <button className="btn-secondary" onClick={() => navigate('/medicines/stock')}>
                  Stock Management
                </button>
                <button className="btn-primary" onClick={() => navigate('/medicines/new')}>
                  <Plus className="w-4 h-4" /> Add Medicine
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilterTab(t.key)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filterTab === t.key
                ? 'bg-primary-600 text-white shadow-sm'
                : `${t.color} hover:bg-gray-50`
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {filterTab === 'all' && (
          <div className="card-header">
            <SearchInput
              value={search}
              onChange={v => { setSearch(v); setPage(0) }}
              placeholder="Search by name, code, generic name…"
            />
          </div>
        )}

        {isLoading ? (
          <Spinner className="h-48" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">Code</th>
                    <th className="table-header">Medicine Name</th>
                    <th className="table-header">Category</th>
                    <th className="table-header">Stock</th>
                    <th className="table-header">Min Level</th>
                    <th className="table-header">Expiry</th>
                    <th className="table-header">Batch</th>
                    <th className="table-header">Status</th>
                    {hasRole('ADMIN', 'PHARMACIST') && <th className="table-header">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {medicines.length === 0 ? (
                    <tr><td colSpan={9}>
                      <EmptyState icon={<Package className="w-10 h-10" />} message="No medicines found" />
                    </td></tr>
                  ) : medicines.map(m => (
                    <tr key={m.id} className={clsx('table-row', rowBg(m.statusColor))}>
                      <td className="table-cell font-mono text-xs text-primary-700">{m.medicineCode}</td>
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">{m.name}</div>
                        {m.genericName && <div className="text-xs text-gray-400">{m.genericName}</div>}
                        {m.strength && <div className="text-xs text-gray-400">{m.strength}</div>}
                      </td>
                      <td className="table-cell">{m.category ?? '—'}</td>
                      <td className="table-cell">
                        <span className={clsx(
                          'font-bold',
                          m.statusColor === 'red' ? 'text-red-600' :
                          m.statusColor === 'yellow' ? 'text-yellow-700' : 'text-green-700'
                        )}>
                          {m.currentStock}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">{m.unit}</span>
                      </td>
                      <td className="table-cell text-gray-500">{m.minStockLevel} {m.unit}</td>
                      <td className="table-cell">
                        {m.expiryDate ? (
                          <span className={clsx(
                            'text-xs font-medium',
                            m.stockStatus === 'EXPIRED' ? 'text-red-600' :
                            m.stockStatus === 'EXPIRING_SOON' ? 'text-yellow-600' : 'text-gray-600'
                          )}>
                            {format(new Date(m.expiryDate), 'dd MMM yyyy')}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="table-cell text-xs text-gray-500">{m.batchNumber ?? '—'}</td>
                      <td className="table-cell"><StockStatusBadge status={m.stockStatus} /></td>
                      {hasRole('ADMIN', 'PHARMACIST') && (
                        <td className="table-cell">
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() => navigate(`/medicines/${m.id}/edit`)}
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filterTab === 'all' && (
              <div className="px-4 border-t border-gray-100">
                <Pagination
                  page={page}
                  totalPages={allData?.totalPages ?? 0}
                  totalElements={allData?.totalElements ?? 0}
                  size={20}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
