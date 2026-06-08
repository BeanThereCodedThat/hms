import api from './client'
import type {
  ApiResponse, PageResponse, AuthUser, Employee, FamilyMember, Doctor,
  Medicine, StockTransaction, OpdVisit, Prescription, Vaccination,
  HealthCheckup, FirstAidBox, FirstAidBoxItem, DocumentRecord,
  Notification, DashboardData, User, DoctorStatus, CheckupStatus,
  TransactionType, DocumentType
} from '../types'

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    api.post<ApiResponse<AuthUser>>('/auth/login', { username, password }),
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get<ApiResponse<DashboardData>>('/dashboard'),
}

// ─── EMPLOYEES ───────────────────────────────────────────────────────────────
export const employeeApi = {
  getAll: (search = '', page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<Employee>>>(`/employees?search=${search}&page=${page}&size=${size}`),
  getById: (id: number) =>
    api.get<ApiResponse<Employee>>(`/employees/${id}`),
  getByCode: (code: string) =>
    api.get<ApiResponse<Employee>>(`/employees/code/${code}`),
  create: (data: Partial<Employee>) =>
    api.post<ApiResponse<Employee>>('/employees', data),
  update: (id: number, data: Partial<Employee>) =>
    api.put<ApiResponse<Employee>>(`/employees/${id}`, data),
  deactivate: (id: number) =>
    api.delete<ApiResponse<void>>(`/employees/${id}`),
  getFamily: (id: number) =>
    api.get<ApiResponse<FamilyMember[]>>(`/employees/${id}/family`),
  addFamilyMember: (id: number, data: Partial<FamilyMember>) =>
    api.post<ApiResponse<FamilyMember>>(`/employees/${id}/family`, data),
  updateFamilyMember: (memberId: number, data: Partial<FamilyMember>) =>
    api.put<ApiResponse<FamilyMember>>(`/employees/family/${memberId}`, data),
  deleteFamilyMember: (memberId: number) =>
    api.delete<ApiResponse<void>>(`/employees/family/${memberId}`),
}

// ─── DOCTORS ─────────────────────────────────────────────────────────────────
export const doctorApi = {
  getAll: () => api.get<ApiResponse<Doctor[]>>('/doctors'),
  getAvailable: () => api.get<ApiResponse<Doctor[]>>('/doctors/available'),
  getById: (id: number) => api.get<ApiResponse<Doctor>>(`/doctors/${id}`),
  create: (data: Partial<Doctor>) => api.post<ApiResponse<Doctor>>('/doctors', data),
  update: (id: number, data: Partial<Doctor>) => api.put<ApiResponse<Doctor>>(`/doctors/${id}`, data),
  updateStatus: (id: number, status: DoctorStatus) =>
    api.patch<ApiResponse<Doctor>>(`/doctors/${id}/status?status=${status}`),
}

// ─── OPD VISITS ──────────────────────────────────────────────────────────────
export const visitApi = {
  getByDate: (date?: string, page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<OpdVisit>>>(`/visits?${date ? `date=${date}&` : ''}page=${page}&size=${size}`),
  getToday: () => api.get<ApiResponse<OpdVisit[]>>('/visits/today'),
  getById: (id: number) => api.get<ApiResponse<OpdVisit>>(`/visits/${id}`),
  getEmployeeHistory: (employeeId: number) =>
    api.get<ApiResponse<OpdVisit[]>>(`/visits/employee/${employeeId}`),
  create: (data: Partial<OpdVisit>) => api.post<ApiResponse<OpdVisit>>('/visits', data),
  update: (id: number, data: Partial<OpdVisit>) => api.put<ApiResponse<OpdVisit>>(`/visits/${id}`, data),
  addPrescription: (id: number, data: Partial<Prescription>) =>
    api.post<ApiResponse<OpdVisit>>(`/visits/${id}/prescription`, data),
  dispense: (id: number) => api.post<ApiResponse<OpdVisit>>(`/visits/${id}/dispense`),
  close: (id: number) => api.post<ApiResponse<OpdVisit>>(`/visits/${id}/close`),
}

// ─── MEDICINES ───────────────────────────────────────────────────────────────
export const medicineApi = {
  getAll: (search = '', page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<Medicine>>>(`/medicines?search=${search}&page=${page}&size=${size}`),
  getAllActive: () => api.get<ApiResponse<Medicine[]>>('/medicines/active'),
  getLowStock: () => api.get<ApiResponse<Medicine[]>>('/medicines/low-stock'),
  getExpiring: () => api.get<ApiResponse<Medicine[]>>('/medicines/expiring'),
  getExpired: () => api.get<ApiResponse<Medicine[]>>('/medicines/expired'),
  getById: (id: number) => api.get<ApiResponse<Medicine>>(`/medicines/${id}`),
  getTransactions: (id: number) =>
    api.get<ApiResponse<StockTransaction[]>>(`/medicines/${id}/transactions`),
  create: (data: Partial<Medicine>) => api.post<ApiResponse<Medicine>>('/medicines', data),
  update: (id: number, data: Partial<Medicine>) =>
    api.put<ApiResponse<Medicine>>(`/medicines/${id}`, data),
  addTransaction: (data: Partial<StockTransaction>) =>
    api.post<ApiResponse<StockTransaction>>('/medicines/transaction', data),
}

// ─── VACCINATIONS ────────────────────────────────────────────────────────────
export const vaccinationApi = {
  getByEmployee: (empId: number) =>
    api.get<ApiResponse<Vaccination[]>>(`/vaccinations/employee/${empId}`),
  getUpcoming: (days = 30) =>
    api.get<ApiResponse<Vaccination[]>>(`/vaccinations/upcoming?days=${days}`),
  getOverdue: () => api.get<ApiResponse<Vaccination[]>>('/vaccinations/overdue'),
  getById: (id: number) => api.get<ApiResponse<Vaccination>>(`/vaccinations/${id}`),
  create: (data: Partial<Vaccination>) =>
    api.post<ApiResponse<Vaccination>>('/vaccinations', data),
  update: (id: number, data: Partial<Vaccination>) =>
    api.put<ApiResponse<Vaccination>>(`/vaccinations/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/vaccinations/${id}`),
}

// ─── HEALTH CHECKUPS ─────────────────────────────────────────────────────────
export const checkupApi = {
  getByEmployee: (empId: number) =>
    api.get<ApiResponse<HealthCheckup[]>>(`/checkups/employee/${empId}`),
  getUpcoming: (days = 30) =>
    api.get<ApiResponse<HealthCheckup[]>>(`/checkups/upcoming?days=${days}`),
  getByStatus: (status: CheckupStatus) =>
    api.get<ApiResponse<HealthCheckup[]>>(`/checkups/status/${status}`),
  getById: (id: number) => api.get<ApiResponse<HealthCheckup>>(`/checkups/${id}`),
  create: (data: Partial<HealthCheckup>) =>
    api.post<ApiResponse<HealthCheckup>>('/checkups', data),
  update: (id: number, data: Partial<HealthCheckup>) =>
    api.put<ApiResponse<HealthCheckup>>(`/checkups/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/checkups/${id}`),
}

// ─── FIRST AID BOXES ─────────────────────────────────────────────────────────
export const firstAidApi = {
  getAll: () => api.get<ApiResponse<FirstAidBox[]>>('/first-aid-boxes'),
  getById: (id: number) => api.get<ApiResponse<FirstAidBox>>(`/first-aid-boxes/${id}`),
  create: (data: Partial<FirstAidBox>) =>
    api.post<ApiResponse<FirstAidBox>>('/first-aid-boxes', data),
  update: (id: number, data: Partial<FirstAidBox>) =>
    api.put<ApiResponse<FirstAidBox>>(`/first-aid-boxes/${id}`, data),
  addItem: (boxId: number, data: Partial<FirstAidBoxItem>) =>
    api.post<ApiResponse<FirstAidBoxItem>>(`/first-aid-boxes/${boxId}/items`, data),
  issueItem: (boxId: number, itemId: number, quantity: number, remarks?: string) =>
    api.post<ApiResponse<FirstAidBoxItem>>(
      `/first-aid-boxes/${boxId}/items/${itemId}/issue?quantity=${quantity}${remarks ? `&remarks=${remarks}` : ''}`
    ),
}

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────
export const documentApi = {
  upload: (file: File, documentType?: DocumentType, employeeId?: number, visitId?: number, vaccinationId?: number) => {
    const fd = new FormData()
    fd.append('file', file)
    if (documentType) fd.append('documentType', documentType)
    if (employeeId) fd.append('employeeId', String(employeeId))
    if (visitId) fd.append('visitId', String(visitId))
    if (vaccinationId) fd.append('vaccinationId', String(vaccinationId))
    return api.post<ApiResponse<DocumentRecord>>('/documents/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getByEmployee: (empId: number) =>
    api.get<ApiResponse<DocumentRecord[]>>(`/documents/employee/${empId}`),
  getByVisit: (visitId: number) =>
    api.get<ApiResponse<DocumentRecord[]>>(`/documents/visit/${visitId}`),
  downloadUrl: (id: number) => `/api/documents/${id}/download`,
  previewUrl: (id: number) => `/api/documents/${id}/preview`,
  delete: (id: number) => api.delete<ApiResponse<void>>(`/documents/${id}`),
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export const notificationApi = {
  getAll: () => api.get<ApiResponse<Notification[]>>('/notifications'),
  getUnread: () => api.get<ApiResponse<Notification[]>>('/notifications/unread'),
  getCount: () => api.get<ApiResponse<number>>('/notifications/count'),
  markRead: (id: number) => api.patch<ApiResponse<void>>(`/notifications/${id}/read`),
  markAllRead: () => api.post<ApiResponse<void>>('/notifications/mark-all-read'),
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
export const reportApi = {
  opd: (from: string, to: string) =>
    api.get<ApiResponse<OpdVisit[]>>(`/reports/opd?from=${from}&to=${to}`),
  firstAid: (from: string, to: string) =>
    api.get<ApiResponse<OpdVisit[]>>(`/reports/first-aid?from=${from}&to=${to}`),
  accidents: (from: string, to: string) =>
    api.get<ApiResponse<OpdVisit[]>>(`/reports/accidents?from=${from}&to=${to}`),
  inventory: () => api.get<ApiResponse<Medicine[]>>('/reports/inventory'),
  stockMovement: (from: string, to: string) =>
    api.get<ApiResponse<StockTransaction[]>>(`/reports/stock-movement?from=${from}&to=${to}`),
  expiry: () => api.get<ApiResponse<Medicine[]>>('/reports/expiry'),
  vaccinations: (from: string, to: string) =>
    api.get<ApiResponse<Vaccination[]>>(`/reports/vaccinations?from=${from}&to=${to}`),
  checkups: (from: string, to: string) =>
    api.get<ApiResponse<HealthCheckup[]>>(`/reports/checkups?from=${from}&to=${to}`),
  visitSummary: (from: string, to: string) =>
    api.get<ApiResponse<Record<string, number>>>(`/reports/visit-summary?from=${from}&to=${to}`),
}

// ─── USERS ───────────────────────────────────────────────────────────────────
export const userApi = {
  getAll: () => api.get<ApiResponse<User[]>>('/users'),
  getById: (id: number) => api.get<ApiResponse<User>>(`/users/${id}`),
  create: (data: Partial<User> & { password: string }) =>
    api.post<ApiResponse<User>>('/users', data),
  update: (id: number, data: Partial<User> & { password?: string }) =>
    api.put<ApiResponse<User>>(`/users/${id}`, data),
  toggleActive: (id: number) => api.patch<ApiResponse<void>>(`/users/${id}/toggle`),
}
