import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportApi } from '../../api'
import { PageHeader, Spinner, StockStatusBadge, VisitStatusBadge } from '../../components/ui'
import { format, subDays } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { FileText, Package, Syringe, Activity, TrendingDown, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

type ReportType = 'opd' | 'firstaid' | 'accidents' | 'inventory' | 'stock_movement' | 'expiry' | 'vaccinations' | 'checkups' | 'summary'

const REPORT_TYPES: { key: ReportType; label: string; icon: React.ReactNode }[] = [
  { key: 'summary',        label: 'Visit Summary',       icon: <TrendingDown className="w-4 h-4" /> },
  { key: 'opd',            label: 'OPD Visits',          icon: <FileText className="w-4 h-4" /> },
  { key: 'firstaid',       label: 'First Aid Cases',     icon: <AlertTriangle className="w-4 h-4" /> },
  { key: 'accidents',      label: 'Minor Accidents',     icon: <AlertTriangle className="w-4 h-4" /> },
  { key: 'inventory',      label: 'Inventory Status',    icon: <Package className="w-4 h-4" /> },
  { key: 'stock_movement', label: 'Stock Movement',      icon: <TrendingDown className="w-4 h-4" /> },
  { key: 'expiry',         label: 'Medicine Expiry',     icon: <AlertTriangle className="w-4 h-4" /> },
  { key: 'vaccinations',   label: 'Vaccinations',        icon: <Syringe className="w-4 h-4" /> },
  { key: 'checkups',       label: 'Health Checkups',     icon: <Activity className="w-4 h-4" /> },
]

export default function ReportsPage() {
  const [report, setReport] = useState<ReportType>('summary')
  const [from, setFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'))

  const { data: opdData, isLoading: loadOpd } = useQuery({
    queryKey: ['report-opd', from, to],
    queryFn: () => reportApi.opd(from, to).then(r => r.data.data),
    enabled: report === 'opd',
  })

  const { data: firstAidData, isLoading: loadFa } = useQuery({
    queryKey: ['report-fa', from, to],
    queryFn: () => reportApi.firstAid(from, to).then(r => r.data.data),
    enabled: report === 'firstaid',
  })

  const { data: accData, isLoading: loadAcc } = useQuery({
    queryKey: ['report-acc', from, to],
    queryFn: () => reportApi.accidents(from, to).then(r => r.data.data),
    enabled: report === 'accidents',
  })

  const { data: inventoryData, isLoading: loadInv } = useQuery({
    queryKey: ['report-inventory'],
    queryFn: () => reportApi.inventory().then(r => r.data.data),
    enabled: report === 'inventory',
  })

  const { data: stockMvData, isLoading: loadSm } = useQuery({
    queryKey: ['report-sm', from, to],
    queryFn: () => reportApi.stockMovement(from, to).then(r => r.data.data),
    enabled: report === 'stock_movement',
  })

  const { data: expiryData, isLoading: loadExp } = useQuery({
    queryKey: ['report-expiry'],
    queryFn: () => reportApi.expiry().then(r => r.data.data),
    enabled: report === 'expiry',
  })

  const { data: vacData, isLoading: loadVac } = useQuery({
    queryKey: ['report-vac', from, to],
    queryFn: () => reportApi.vaccinations(from, to).then(r => r.data.data),
    enabled: report === 'vaccinations',
  })

  const { data: checkupData, isLoading: loadChk } = useQuery({
    queryKey: ['report-chk', from, to],
    queryFn: () => reportApi.checkups(from, to).then(r => r.data.data),
    enabled: report === 'checkups',
  })

  const { data: summaryData, isLoading: loadSum } = useQuery({
    queryKey: ['report-summary', from, to],
    queryFn: () => reportApi.visitSummary(from, to).then(r => r.data.data),
    enabled: report === 'summary',
  })

  const isLoading = loadOpd || loadFa || loadAcc || loadInv || loadSm || loadExp || loadVac || loadChk || loadSum

  const fmtDate = (d: string) => format(new Date(d), 'dd MMM yyyy')
  const fmtDt = (d?: string) => d ? format(new Date(d), 'dd MMM yyyy HH:mm') : '—'

  const chartData = summaryData
    ? Object.entries(summaryData).map(([name, value]) => ({ name: name.replace('_', ' '), value }))
    : []

  const CHART_COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#06b6d4']

  const needsDateRange = !['inventory', 'expiry'].includes(report)

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate operational and management reports" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="card h-fit">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-700">Report Type</h2>
          </div>
          <div className="p-2 space-y-0.5">
            {REPORT_TYPES.map(r => (
              <button
                key={r.key}
                onClick={() => setReport(r.key)}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left',
                  report === r.key
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {r.icon} {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Report Content */}
        <div className="col-span-3 space-y-4">
          {/* Date range filter */}
          {needsDateRange && (
            <div className="card">
              <div className="card-body flex items-end gap-4 flex-wrap">
                <div>
                  <label className="label">From Date</label>
                  <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="label">To Date</label>
                  <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input" />
                </div>
                <div className="flex gap-2">
                  {[7, 30, 90].map(d => (
                    <button key={d} className="btn-secondary btn-sm"
                      onClick={() => { setFrom(format(subDays(new Date(), d), 'yyyy-MM-dd')); setTo(format(new Date(), 'yyyy-MM-dd')) }}>
                      Last {d}d
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isLoading ? <Spinner className="h-48" /> : (
            <>
              {/* Visit Summary Chart */}
              {report === 'summary' && summaryData && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-sm font-semibold text-gray-800">Visit Summary: {fmtDate(from)} – {fmtDate(to)}</h2>
                    <span className="badge-blue">{Object.values(summaryData).reduce((a, b) => a + b, 0)} total</span>
                  </div>
                  <div className="card-body">
                    {chartData.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-8">No visits in selected period</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData} barSize={50}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                      {chartData.map((d, i) => (
                        <div key={d.name} className="p-3 bg-gray-50 rounded-lg text-center">
                          <p className="text-2xl font-bold" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>{d.value}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{d.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* OPD / First Aid / Accidents table */}
              {['opd', 'firstaid', 'accidents'].includes(report) && (() => {
                const rows = report === 'opd' ? (opdData ?? []) : report === 'firstaid' ? (firstAidData ?? []) : (accData ?? [])
                const title = report === 'opd' ? 'OPD Visits' : report === 'firstaid' ? 'First Aid Cases' : 'Minor Accidents'
                return (
                  <div className="card">
                    <div className="card-header">
                      <h2 className="text-sm font-semibold text-gray-800">{title}: {fmtDate(from)} – {fmtDate(to)}</h2>
                      <span className="badge-blue">{rows.length} records</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr>
                          <th className="table-header">Visit #</th>
                          <th className="table-header">Date</th>
                          <th className="table-header">Employee</th>
                          <th className="table-header">Type</th>
                          <th className="table-header">Doctor</th>
                          <th className="table-header">Diagnosis</th>
                          <th className="table-header">Status</th>
                        </tr></thead>
                        <tbody>
                          {rows.length === 0 ? (
                            <tr><td colSpan={7} className="table-cell text-center text-gray-400 py-8">No records in selected period</td></tr>
                          ) : rows.map(v => (
                            <tr key={v.id} className="table-row">
                              <td className="table-cell font-mono text-xs">{v.visitNumber}</td>
                              <td className="table-cell text-xs">{v.visitDate ? fmtDate(v.visitDate) : '—'}</td>
                              <td className="table-cell font-medium">{v.employeeName}</td>
                              <td className="table-cell"><span className="badge-blue text-xs">{v.visitType?.replace('_', ' ')}</span></td>
                              <td className="table-cell">{v.doctorName ?? '—'}</td>
                              <td className="table-cell text-gray-500 max-w-[150px] truncate">{v.diagnosis ?? '—'}</td>
                              <td className="table-cell"><VisitStatusBadge status={v.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })()}

              {/* Inventory / Expiry table */}
              {['inventory', 'expiry'].includes(report) && (() => {
                const rows = report === 'inventory' ? (inventoryData ?? []) : (expiryData ?? [])
                const title = report === 'inventory' ? 'Full Inventory Status' : 'Medicines Expiring Soon'
                return (
                  <div className="card">
                    <div className="card-header">
                      <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
                      <span className="badge-blue">{rows.length} medicines</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr>
                          <th className="table-header">Code</th>
                          <th className="table-header">Medicine</th>
                          <th className="table-header">Category</th>
                          <th className="table-header">Stock</th>
                          <th className="table-header">Min Level</th>
                          <th className="table-header">Expiry</th>
                          <th className="table-header">Status</th>
                        </tr></thead>
                        <tbody>
                          {rows.map(m => (
                            <tr key={m.id} className={clsx('table-row',
                              m.statusColor === 'red' ? 'bg-red-50/30' : m.statusColor === 'yellow' ? 'bg-yellow-50/30' : ''
                            )}>
                              <td className="table-cell font-mono text-xs">{m.medicineCode}</td>
                              <td className="table-cell font-medium">{m.name}{m.strength && <span className="text-xs text-gray-400 ml-1">{m.strength}</span>}</td>
                              <td className="table-cell">{m.category ?? '—'}</td>
                              <td className="table-cell font-bold">{m.currentStock} <span className="text-xs text-gray-400">{m.unit}</span></td>
                              <td className="table-cell">{m.minStockLevel}</td>
                              <td className="table-cell text-xs">{m.expiryDate ? fmtDate(m.expiryDate) : '—'}</td>
                              <td className="table-cell"><StockStatusBadge status={m.stockStatus} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })()}

              {/* Stock Movement */}
              {report === 'stock_movement' && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-sm font-semibold text-gray-800">Stock Movement: {fmtDate(from)} – {fmtDate(to)}</h2>
                    <span className="badge-blue">{stockMvData?.length ?? 0} transactions</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr>
                        <th className="table-header">Date/Time</th>
                        <th className="table-header">Medicine</th>
                        <th className="table-header">Type</th>
                        <th className="table-header">Quantity</th>
                        <th className="table-header">Balance</th>
                        <th className="table-header">Remarks</th>
                        <th className="table-header">By</th>
                      </tr></thead>
                      <tbody>
                        {(stockMvData ?? []).length === 0 ? (
                          <tr><td colSpan={7} className="table-cell text-center text-gray-400 py-8">No transactions in period</td></tr>
                        ) : (stockMvData ?? []).map(tx => (
                          <tr key={tx.id} className="table-row">
                            <td className="table-cell text-xs">{fmtDt(tx.transactionDate)}</td>
                            <td className="table-cell font-medium">{tx.medicineName}</td>
                            <td className="table-cell">
                              <span className={clsx('badge text-xs',
                                tx.transactionType === 'INWARD' ? 'badge-green' :
                                tx.transactionType === 'ISSUE' ? 'badge-blue' : 'badge-red'
                              )}>
                                {tx.transactionType.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="table-cell font-bold">
                              <span className={tx.transactionType === 'INWARD' ? 'text-green-600' : 'text-red-600'}>
                                {tx.transactionType === 'INWARD' ? '+' : '-'}{tx.quantity}
                              </span>
                            </td>
                            <td className="table-cell">{tx.balanceAfter ?? '—'}</td>
                            <td className="table-cell text-xs text-gray-500 max-w-[150px] truncate">{tx.remarks ?? '—'}</td>
                            <td className="table-cell text-xs text-gray-400">{tx.createdBy ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Vaccinations report */}
              {report === 'vaccinations' && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-sm font-semibold text-gray-800">Vaccinations: {fmtDate(from)} – {fmtDate(to)}</h2>
                    <span className="badge-blue">{vacData?.length ?? 0} records</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr>
                        <th className="table-header">Employee</th>
                        <th className="table-header">Vaccine</th>
                        <th className="table-header">Dose</th>
                        <th className="table-header">Administered</th>
                        <th className="table-header">Due Date</th>
                        <th className="table-header">Status</th>
                      </tr></thead>
                      <tbody>
                        {(vacData ?? []).length === 0 ? (
                          <tr><td colSpan={6} className="table-cell text-center text-gray-400 py-8">No vaccinations in period</td></tr>
                        ) : (vacData ?? []).map(v => (
                          <tr key={v.id} className="table-row">
                            <td className="table-cell font-medium">{v.employeeName}</td>
                            <td className="table-cell">{v.vaccineName}</td>
                            <td className="table-cell">{v.doseNumber ?? '—'}</td>
                            <td className="table-cell text-xs">{v.administeredDate ? fmtDate(v.administeredDate) : '—'}</td>
                            <td className="table-cell text-xs">{v.dueDate ? fmtDate(v.dueDate) : '—'}</td>
                            <td className="table-cell">
                              <span className={v.completed ? 'badge-green' : 'badge-yellow'}>
                                {v.completed ? 'Completed' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Checkups report */}
              {report === 'checkups' && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-sm font-semibold text-gray-800">Health Checkups: {fmtDate(from)} – {fmtDate(to)}</h2>
                    <span className="badge-blue">{checkupData?.length ?? 0} records</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr>
                        <th className="table-header">Employee</th>
                        <th className="table-header">Type</th>
                        <th className="table-header">Scheduled</th>
                        <th className="table-header">Completed</th>
                        <th className="table-header">Status</th>
                        <th className="table-header">Findings</th>
                      </tr></thead>
                      <tbody>
                        {(checkupData ?? []).length === 0 ? (
                          <tr><td colSpan={6} className="table-cell text-center text-gray-400 py-8">No checkups in period</td></tr>
                        ) : (checkupData ?? []).map(c => (
                          <tr key={c.id} className="table-row">
                            <td className="table-cell font-medium">{c.employeeName}</td>
                            <td className="table-cell">{c.checkupType}</td>
                            <td className="table-cell text-xs">{c.scheduledDate ? fmtDate(c.scheduledDate) : '—'}</td>
                            <td className="table-cell text-xs">{c.completedDate ? fmtDate(c.completedDate) : '—'}</td>
                            <td className="table-cell">
                              <span className={
                                c.status === 'COMPLETED' ? 'badge-green' :
                                c.status === 'OVERDUE' ? 'badge-red' :
                                c.status === 'SCHEDULED' ? 'badge-blue' : 'badge-gray'
                              }>{c.status}</span>
                            </td>
                            <td className="table-cell text-xs text-gray-500 max-w-[150px] truncate">{c.findings ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
