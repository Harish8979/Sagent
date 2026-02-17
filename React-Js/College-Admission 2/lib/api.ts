import type {
  LoginFormData,
  Student,
  Application,
  Course,
  Document,
  Payment,
  CreateStudentData,
  UpdateAcademicData,
  CreateApplicationData,
  CreateCourseData,
  CreatePaymentData,
  AuthUser,
} from "./types"

const API_BASE_URL = "http://localhost:8080"

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

function getHeaders(isMultipart = false): HeadersInit {
  const token = getToken()
  const headers: HeadersInit = {}
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  if (!isMultipart) {
    headers["Content-Type"] = "application/json"
  }
  return headers
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const text = await response.text()
      if (text) {
        try {
          const json = JSON.parse(text)
          message = json.message || json.error || message
        } catch {
          message = text
        }
      }
    } catch {
      // keep default message
    }
    throw new ApiError(message, response.status)
  }
  const text = await response.text()
  if (!text) return "" as unknown as T
  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}

// ======================
// AUTH API
// ======================

/** POST /auth/register - returns the created User object */
export async function registerApi(data: {
  fullName: string
  email: string
  password: string
  role: string
}): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleResponse<AuthUser>(res)
}

/** POST /auth/login - returns a token string */
export type LoginResponse = { token: string; user?: AuthUser } | string

export async function loginApi(
  data: LoginFormData
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const result = await handleResponse<any>(res)

  // Normalize different possible backend shapes:
  // - plain string token
  // - { token: string }
  // - { token: string, user: {...} }
  if (typeof result === "string") return result
  if (result && typeof result === "object") {
    if (result.token && typeof result.token === "string") {
      return { token: result.token, user: result.user }
    }
    // Some backends may return { auth_token: "..." }
    if (result.auth_token && typeof result.auth_token === "string") {
      return { token: result.auth_token, user: result.user }
    }
  }

  throw new ApiError("Invalid login response from server", res?.status || 0)
}

/** POST /auth/logout */
export async function logoutApi(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: getHeaders(),
  })
}

/** GET /auth/me - returns currently authenticated user (optional) */
export async function getCurrentUser(): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(),
  })
  return handleResponse<AuthUser>(res)
}

// ======================
// STUDENT API
// ======================

/** POST /students - create student profile */
export async function createStudent(data: CreateStudentData): Promise<Student> {
  const res = await fetch(`${API_BASE_URL}/students`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse<Student>(res)
}

/** GET /students/{id} */
export async function getStudentById(id: number): Promise<Student> {
  const res = await fetch(`${API_BASE_URL}/students/${id}`, {
    headers: getHeaders(),
  })
  return handleResponse<Student>(res)
}

/** PUT /students/{id}/academic */
export async function updateStudentAcademic(
  id: number,
  data: UpdateAcademicData
): Promise<Student> {
  const res = await fetch(`${API_BASE_URL}/students/${id}/academic`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse<Student>(res)
}

// ======================
// APPLICATION API
// ======================

/** POST /applications */
export async function createApplication(
  data: CreateApplicationData
): Promise<Application> {
  const res = await fetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse<Application>(res)
}

/** GET /applications - all applications (OFFICER/ADMIN) */
export async function getAllApplications(): Promise<Application[]> {
  const res = await fetch(`${API_BASE_URL}/applications`, {
    headers: getHeaders(),
  })
  return handleResponse<Application[]>(res)
}

/** GET /applications/{id} */
export async function getApplicationById(id: number): Promise<Application> {
  const res = await fetch(`${API_BASE_URL}/applications/${id}`, {
    headers: getHeaders(),
  })
  return handleResponse<Application>(res)
}

/** GET /applications/student/{studentId} */
export async function getStudentApplications(
  studentId: number
): Promise<Application[]> {
  const res = await fetch(
    `${API_BASE_URL}/applications/student/${studentId}`,
    { headers: getHeaders() }
  )
  return handleResponse<Application[]>(res)
}

/** PUT /applications/{id}/submit */
export async function submitApplication(id: number): Promise<Application> {
  const res = await fetch(`${API_BASE_URL}/applications/${id}/submit`, {
    method: "PUT",
    headers: getHeaders(),
  })
  return handleResponse<Application>(res)
}

/** PUT /applications/{id}/review */
export async function startReview(id: number): Promise<Application> {
  const res = await fetch(`${API_BASE_URL}/applications/${id}/review`, {
    method: "PUT",
    headers: getHeaders(),
  })
  return handleResponse<Application>(res)
}

/** PUT /applications/{id}/approve */
export async function approveApplication(id: number): Promise<Application> {
  const res = await fetch(`${API_BASE_URL}/applications/${id}/approve`, {
    method: "PUT",
    headers: getHeaders(),
  })
  return handleResponse<Application>(res)
}

/** PUT /applications/{id}/reject */
export async function rejectApplication(id: number): Promise<Application> {
  const res = await fetch(`${API_BASE_URL}/applications/${id}/reject`, {
    method: "PUT",
    headers: getHeaders(),
  })
  return handleResponse<Application>(res)
}

/** PUT /applications/{id}/payment-complete */
export async function markPaymentComplete(id: number): Promise<Application> {
  const res = await fetch(
    `${API_BASE_URL}/applications/${id}/payment-complete`,
    { method: "PUT", headers: getHeaders() }
  )
  return handleResponse<Application>(res)
}

// ======================
// COURSE API
// ======================

/** GET /courses - no auth required */
export async function getCourses(): Promise<Course[]> {
  const res = await fetch(`${API_BASE_URL}/courses`)
  return handleResponse<Course[]>(res)
}

/** POST /courses - ADMIN only */
export async function createCourse(data: CreateCourseData): Promise<Course> {
  const res = await fetch(`${API_BASE_URL}/courses`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse<Course>(res)
}

// ======================
// DOCUMENT API
// ======================

/** POST /documents/upload - multipart/form-data */
export async function uploadDocument(
  file: File,
  applicationId: number,
  documentType: string,
  onProgress?: (progress: number) => void
): Promise<Document> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append("file", file)
    formData.append("applicationId", applicationId.toString())
    formData.append("documentType", documentType)

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText))
        } catch {
          resolve({} as Document)
        }
      } else {
        reject(new ApiError("Upload failed", xhr.status))
      }
    })

    xhr.addEventListener("error", () => {
      reject(new ApiError("Upload failed", 0))
    })

    xhr.open("POST", `${API_BASE_URL}/documents/upload`)
    const token = getToken()
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    }
    xhr.send(formData)
  })
}

/** GET /documents/application/{applicationId} */
export async function getApplicationDocuments(
  applicationId: number
): Promise<Document[]> {
  const res = await fetch(
    `${API_BASE_URL}/documents/application/${applicationId}`,
    { headers: getHeaders() }
  )
  return handleResponse<Document[]>(res)
}

// ======================
// PAYMENT API
// ======================

/** POST /payments */
export async function createPayment(data: CreatePaymentData): Promise<Payment> {
  const res = await fetch(`${API_BASE_URL}/payments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse<Payment>(res)
}

// ======================
// ADMIN API
// ======================

/** DELETE /admin/reset-database */
export async function resetDatabase(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/admin/reset-database`, {
    method: "DELETE",
    headers: getHeaders(),
  })
  return handleResponse<string>(res)
}
