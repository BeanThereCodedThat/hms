import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../api'
import { PageHeader, Spinner } from '../components/ui'
import { Bell, BellOff, CheckCheck, AlertTriangle, Package, Syringe, Activity } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import type { Notification, NotificationType } from '../types'
import clsx from 'clsx'

const TYPE_META: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  VACCINATION_DUE:     { icon: <Syringe className="w-4 h-4" />,       color: 'text-blue-600',   bg: 'bg-blue-50' },
  CHECKUP_DUE:         { icon: <Activity className="w-4 h-4" />,      color: 'text-indigo-600', bg: 'bg-indigo-50' },
  MEDICINE_EXPIRY:     { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-600',    bg: 'bg-red-50' },
  LOW_STOCK:           { icon: <Package className="w-4 h-4" />,       color: 'text-orange-600', bg: 'bg-orange-50' },
  OVERDUE_VACCINATION: { icon: <Syringe className="w-4 h-4" />,       color: 'text-red-700',    bg: 'bg-red-50' },
  OVERDUE_CHECKUP:     { icon: <Activity className="w-4 h-4" />,      color: 'text-red-700',    bg: 'bg-red-50' },
}

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications-all'],
    queryFn: () => notificationApi.getAll().then(r => r.data.data),
  })

  const markReadMut = useMutation({
    mutationFn: (id: number) => notificationApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications-all'] })
      qc.invalidateQueries({ queryKey: ['notif-count'] })
    },
  })

  const markAllMut = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read')
      qc.invalidateQueries({ queryKey: ['notifications-all'] })
      qc.invalidateQueries({ queryKey: ['notif-count'] })
    },
  })

  const unreadCount = (notifications ?? []).filter(n => !n.read).length

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        actions={
          unreadCount > 0 ? (
            <button className="btn-secondary" onClick={() => markAllMut.mutate()} disabled={markAllMut.isPending}>
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          ) : undefined
        }
      />

      {isLoading ? (
        <Spinner className="h-48" />
      ) : (notifications ?? []).length === 0 ? (
        <div className="card p-12 text-center">
          <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(notifications ?? []).map(n => {
            const meta = TYPE_META[n.type] ?? { icon: <Bell className="w-4 h-4" />, color: 'text-gray-600', bg: 'bg-gray-50' }
            return (
              <div
                key={n.id}
                className={clsx(
                  'card p-4 flex items-start gap-4 transition-all',
                  !n.read && 'border-l-4 border-l-primary-500 bg-primary-50/30'
                )}
              >
                <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', meta.bg)}>
                  <span className={meta.color}>{meta.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={clsx('text-sm font-semibold', !n.read ? 'text-gray-900' : 'text-gray-600')}>
                      {n.title}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {n.createdAt ? format(new Date(n.createdAt), 'dd MMM HH:mm') : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {n.type.replace(/_/g, ' ')}
                    </span>
                    {!n.read && (
                      <button
                        className="text-xs text-primary-600 hover:underline"
                        onClick={() => markReadMut.mutate(n.id)}
                      >
                        Mark as read
                      </button>
                    )}
                    {n.read && <span className="text-xs text-gray-400">✓ Read</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
