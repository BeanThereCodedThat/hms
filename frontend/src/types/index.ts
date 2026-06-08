export type Role = 'ADMIN' | 'DOCTOR' | 'PHARMACIST' | 'OPD_STAFF'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type BloodGroup = 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'AB_POS' | 'AB_NEG' | 'O_POS' | 'O_NEG'
export type RelationType = 'SPOUSE' | 'CHILD' | 'PARENT' | 'SIBLING' | 'OTHER'
export type DoctorStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'ON_LEAVE' | 'ASSIGNED'
export type VisitType = 'OPD_CONSULTATION' | 'FIRST_AID' | 'MINOR_ACCIDENT' | 'FOLLOW_UP' | 'VACCINATION' | 'MEDICAL_CHECKUP'
export type VisitStatus = 'REGISTERED' | 'IN_CONSULTATION' | 'PRESCRIPTION_ISSUED' | 'MEDICINES_DISPENSED' | 'CLOSED'
export type StockStatus = 'HEALTHY' | 'LOW' | 'CRITICAL' | 'EXPIRED' | 'EXPIRING_SOON'
export type TransactionType = 'INWARD' | 'ISSUE' | 'DISCARD' | 'ADJUSTMENT' | 'FIRST_AID_ISSUE'
export type CheckupStatus = 'SCHEDULED' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED'
export type DocumentType = 'MEDICAL_REPORT' | 'HEALTH_CHECKUP_REPORT' | 'VACCINATION_CERTIFICATE' | 'PRESCRIPTION' | 'SUPPORTING_DOCUMENT'
export type NotificationType = 'VACCINATION_DUE' | 'CHECKUP_DUE' | 'MEDICINE_EXPIRY' | 'LOW_STOCK' | 'OVERDUE_VACCINATION' | 'OVERDUE_CHECKUP'

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface AuthUser {
  token: string
  username: string
  fullName: string
  role: Role
  userId: number
}

export interface Employee {
  id: number
  employeeCode: string
  firstName: string
  lastName: string
  fullName: string
  gender?: Gender
  dateOfBirth?: string
  contactNumber?: string
  email?: string
  address?: string
  department?: string
  designation?: string
  bloodGroup?: BloodGroup
  smartCardId?: string
  joiningDate?: string
  active: boolean
  medicalHistory?: string
  allergies?: string
  chronicConditions?: string
  createdAt?: string
  createdBy?: string
}

export interface FamilyMember {
  id: number
  employeeId: number
  firstName: string
  lastName: string
  relation: RelationType
  gender?: Gender
  dateOfBirth?: string
  contactNumber?: string
  bloodGroup?: BloodGroup
  medicalHistory?: string
  allergies?: string
}

export interface Doctor {
  id: number
  doctorCode: string
  firstName: string
  lastName: string
  fullName: string
  specialization?: string
  qualification?: string
  registrationNumber?: string
  contactNumber?: string
  email?: string
  status: DoctorStatus
  currentShift?: string
  active: boolean
}

export interface Medicine {
  id: number
  medicineCode: string
  name: string
  genericName?: string
  category?: string
  manufacturer?: string
  unit?: string
  strength?: string
  currentStock: number
  minStockLevel: number
  criticalStockLevel: number
  expiryDate?: string
  batchNumber?: string
  unitPrice?: number
  storageLocation?: string
  stockStatus: StockStatus
  statusColor: 'green' | 'yellow' | 'red'
  active: boolean
  description?: string
}

export interface StockTransaction {
  id: number
  medicineId: number
  medicineName?: string
  transactionType: TransactionType
  quantity: number
  balanceAfter?: number
  transactionDate?: string
  batchNumber?: string
  expiryDate?: string
  remarks?: string
  createdBy?: string
}

export interface PrescriptionItem {
  id?: number
  medicineId: number
  medicineName?: string
  medicineCode?: string
  quantity: number
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string
  dispensed?: boolean
  dispensedQuantity?: number
}

export interface Prescription {
  id?: number
  visitId?: number
  doctorId?: number
  doctorName?: string
  prescribedAt?: string
  dispensedAt?: string
  notes?: string
  dispensed?: boolean
  items: PrescriptionItem[]
}

export interface OpdVisit {
  id: number
  visitNumber: string
  employeeId: number
  employeeName?: string
  employeeCode?: string
  doctorId?: number
  doctorName?: string
  visitType: VisitType
  status: VisitStatus
  visitDate: string
  registrationTime?: string
  consultationTime?: string
  closedTime?: string
  chiefComplaint?: string
  diagnosis?: string
  treatment?: string
  remarks?: string
  followUpDate?: string
  followUpInstructions?: string
  bloodPressure?: string
  pulse?: string
  temperature?: string
  weight?: string
  height?: string
  spO2?: string
  prescription?: Prescription
  createdAt?: string
  createdBy?: string
}

export interface Vaccination {
  id: number
  employeeId: number
  employeeName?: string
  vaccineName: string
  vaccineType?: string
  administeredDate?: string
  dueDate?: string
  nextDueDate?: string
  batchNumber?: string
  administeredBy?: string
  siteOfInjection?: string
  notes?: string
  completed: boolean
  doseNumber?: string
}

export interface HealthCheckup {
  id: number
  employeeId: number
  employeeName?: string
  checkupType: string
  scheduledDate?: string
  completedDate?: string
  status: CheckupStatus
  conductedBy?: string
  findings?: string
  recommendations?: string
  nextDueDate?: string
  remarks?: string
}

export interface FirstAidBoxItem {
  id?: number
  firstAidBoxId?: number
  medicineId: number
  medicineName?: string
  currentQuantity: number
  minimumQuantity?: number
  remarks?: string
}

export interface FirstAidBox {
  id: number
  boxCode: string
  location: string
  department?: string
  responsiblePerson?: string
  active: boolean
  remarks?: string
  items: FirstAidBoxItem[]
}

export interface DocumentRecord {
  id: number
  fileName: string
  fileType: string
  fileSize?: number
  documentType?: DocumentType
  uploadedAt?: string
  uploadedBy?: string
  employeeId?: number
  visitId?: number
  vaccinationId?: number
}

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  targetRole: string
  read: boolean
  createdAt?: string
  referenceId?: string
  referenceType?: string
}

export interface DashboardData {
  totalEmployees: number
  todayVisits: number
  todayFirstAid: number
  todayAccidents: number
  lowStockMedicines: number
  expiringMedicines: number
  expiredMedicines: number
  upcomingVaccinations: number
  upcomingCheckups: number
  pendingVisits: number
  recentVisits: OpdVisit[]
  lowStockList: Medicine[]
  notifications: Notification[]
}

export interface User {
  id: number
  username: string
  fullName: string
  email?: string
  role: Role
  active: boolean
}
