"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { AuthUser, UserRole } from "./types"

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  // accept either a token string or an object with { token }
  login: (token: string | { token: string }, user: AuthUser) => void
  logout: () => void
  isAuthenticated: boolean
  hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function decodeToken(token: string): { exp?: number; sub?: string } | null {
  try {
    const payload = token.split(".")[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return false // if no exp, assume valid
  return decoded.exp * 1000 < Date.now()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token")
    const storedUser = localStorage.getItem("auth_user")

    if (storedToken && storedUser) {
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
      } else {
        setToken(storedToken)
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          localStorage.removeItem("auth_user")
        }
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((newToken: string | { token: string }, newUser: AuthUser) => {
    // Normalize token that may have been passed as an object
    const tokenStr = typeof newToken === "string" ? newToken : newToken?.token
    if (!tokenStr || tokenStr === "[object Object]") return

    localStorage.setItem("auth_token", tokenStr)
    localStorage.setItem("auth_user", JSON.stringify(newUser))
    setToken(tokenStr)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    localStorage.removeItem("student_id")
    setToken(null)
    setUser(null)
  }, [])

  const hasRole = useCallback(
    (role: UserRole) => user?.role === role,
    [user]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
