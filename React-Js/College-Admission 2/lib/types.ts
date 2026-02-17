export type UserRole = "STUDENT" | "OFFICER" | "ADMIN"

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"

// --- Backend Entities (exact match) ---

export interface User {
  userId: number
  fullName: string
  email: string
  password?: string
  role: UserRole
}

export interface Student {
  studentId: number
  user: User
  dob: string
  gender?: string
  phone?: string
  address?: string
  previousEducation?: string
  marksPercentage?: number
  passingYear?: number
  boardUniversity?: string
}

export interface Course {
  courseId: number
  courseCode: string
  courseName: string
  durationYears?: number
  totalSeats?: number
}

export interface Application {
  applicationId: number
  student: Student
  course: Course
  applicationNumber: string
  status: ApplicationStatus
  appliedAt: string
  isPaymentCompleted: boolean
  submittedAt?: string
}

export interface Document {
  documentId: number
  application: Application
  documentType: string
  filePath: string
  uploadedAt: string
}

export interface Payment {
  paymentId: number
  application: Application
  amount: number
  paymentMethod: string
  transactionId: string
  paymentStatus: string
  paidAt: string
}

// --- Form Data ---

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
}

export interface CreateStudentData {
  user: { userId: number }
  dob: string
  gender?: string
  phone?: string
  address?: string
  previousEducation?: string
  marksPercentage?: number
  passingYear?: number
  boardUniversity?: string
}

export interface UpdateAcademicData {
  previousEducation: string
  marksPercentage: number
  passingYear: number
  boardUniversity: string
}

export interface CreateApplicationData {
  studentId: number
  courseId: number
  applicationNumber: string
}

export interface CreateCourseData {
  courseCode: string
  courseName: string
  durationYears?: number
  totalSeats?: number
}

export interface CreatePaymentData {
  application: { applicationId: number }
  amount: number
  paymentMethod: string
  transactionId: string
  paymentStatus: string
}

// --- Auth stored user (decoded from token + register response) ---
export interface AuthUser {
  userId: number
  fullName: string
  email: string
  role: UserRole
}
