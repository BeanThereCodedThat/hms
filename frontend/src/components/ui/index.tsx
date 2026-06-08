import React from 'react'
import clsx from 'clsx'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { StockStatus, VisitStatus, DoctorStatus, CheckupStatus } from '../../types'

// ─── LOADING SPINNER ─────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={clsx('relative bg-white rounded-xl shadow-xl w-full', widths[size], 'max-h-[90vh] flex flex-col')}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── CONFIRM DIALOG ──────────────────────────────────────────────────────────
interface ConfirmProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmLabel?: string
  variant?: 'danger' | 'warning'
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm', message, confirmLabel = 'Confirm', variant = 'danger' }: ConfirmProps) {
  if (!isOpen) return null
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6">
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className={variant === 'danger' ? 'btn-danger' : 'btn-warning'}
            onClick={() => { onConfirm(); onClose() }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── PAGINATION ──────────────────────────────────────────────────────────────
interface PaginationProps {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPageChange: (p: number) => void
}

export function Pagination({ page, totalPages, totalElements, size, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null
  const from = page * size + 1
  const to = Math.min((page + 1) * size, totalElements)
  return (
    <div className="flex items-center justify-between px-2 py-3 text-sm text-gray-600">
      <span>Showing {from}–{to} of {totalElements}</span>
      <div className="flex gap-1">
        <button
          className="btn-secondary btn-sm" disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="w-3 h-3" />
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          const p = totalPages <= 7 ? i : (page < 4 ? i : page - 3 + i)
          if (p >= totalPages) return null
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={clsx('btn btn-sm min-w-[32px] justify-center', p === page ? 'btn-primary' : 'btn-secondary')}
            >
              {p + 1}
            </button>
          )
        })}
        <button
          className="btn-secondary btn-sm" disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
export function EmptyState({ message = 'No records found', icon }: { message?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      {icon && <div className="mb-3 opacity-40">{icon}</div>}
      <p className="text-sm">{message}</p>
    </div>
  )
}

// ─── STOCK STATUS BADGE ──────────────────────────────────────────────────────
export function StockStatusBadge({ status }: { status: StockStatus }) {
  const map: Record<StockStatus, string> = {
    HEALTHY:      'badge-green',
    LOW:          'badge-yellow',
    CRITICAL:     'badge-red',
    EXPIRING_SOON:'badge-yellow',
    EXPIRED:      'badge-red',
  }
  return <span className={map[status]}>{status.replace('_', ' ')}</span>
}

// ─── VISIT STATUS BADGE ──────────────────────────────────────────────────────
export function VisitStatusBadge({ status }: { status: VisitStatus }) {
  const map: Record<VisitStatus, string> = {
    REGISTERED:           'badge-blue',
    IN_CONSULTATION:      'badge-yellow',
    PRESCRIPTION_ISSUED:  'badge-yellow',
    MEDICINES_DISPENSED:  'badge-green',
    CLOSED:               'badge-gray',
  }
  const labels: Record<VisitStatus, string> = {
    REGISTERED:           'Registered',
    IN_CONSULTATION:      'In Consultation',
    PRESCRIPTION_ISSUED:  'Rx Issued',
    MEDICINES_DISPENSED:  'Dispensed',
    CLOSED:               'Closed',
  }
  return <span className={map[status]}>{labels[status]}</span>
}

// ─── DOCTOR STATUS BADGE ─────────────────────────────────────────────────────
export function DoctorStatusBadge({ status }: { status: DoctorStatus }) {
  const map: Record<DoctorStatus, string> = {
    AVAILABLE:   'badge-green',
    UNAVAILABLE: 'badge-red',
    ON_LEAVE:    'badge-yellow',
    ASSIGNED:    'badge-blue',
  }
  return <span className={map[status]}>{status.replace('_', ' ')}</span>
}

// ─── CHECKUP STATUS BADGE ────────────────────────────────────────────────────
export function CheckupStatusBadge({ status }: { status: CheckupStatus }) {
  const map: Record<CheckupStatus, string> = {
    SCHEDULED:  'badge-blue',
    COMPLETED:  'badge-green',
    OVERDUE:    'badge-red',
    CANCELLED:  'badge-gray',
  }
  return <span className={map[status]}>{status}</span>
}

// ─── FORM FIELD ──────────────────────────────────────────────────────────────
interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  hint?: string
}

export function FormField({ label, error, required, children, hint }: FormFieldProps) {
  return (
    <div>
      <label className="label">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── PAGE HEADER ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}

// ─── SEARCH INPUT ────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search…' }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        className="input pl-9"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
