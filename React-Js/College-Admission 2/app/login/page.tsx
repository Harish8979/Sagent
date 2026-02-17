"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { loginApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading"
import { GraduationCap, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import type { UserRole, AuthUser } from "@/lib/types"

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedRole = (searchParams.get("role") as UserRole) || null

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(`/${user.role.toLowerCase()}`)
    }
  }, [isAuthenticated, user, router])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address"
    }
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const loginResult = await loginApi({ email, password })

      // loginApi now returns either a string token or { token, user }
      const token = typeof loginResult === "string" ? loginResult : loginResult.token
      const userFromResponse =
        typeof loginResult === "object" && "user" in loginResult
          ? (loginResult as { token: string; user?: AuthUser }).user
          : undefined

      // Determine user: prefer response user, else decode JWT if possible,
      // otherwise attempt to call GET /auth/me to fetch user info.
      let authUser: AuthUser | undefined = userFromResponse

      if (!authUser && token && token.split(".").length === 3) {
        const decoded = decodeJwt(token)
        authUser = {
          userId: (decoded?.userId as number) || 0,
          fullName:
            (decoded?.fullName as string) || (decoded?.sub as string) || email,
          email: (decoded?.email as string) || (decoded?.sub as string) || email,
          role: (decoded?.role as UserRole) || selectedRole || "STUDENT",
        }
      }

      if (!authUser) {
        // Try fetching current user from backend if endpoint exists
        try {
          const { getCurrentUser } = await import("@/lib/api")
          authUser = await getCurrentUser()
        } catch (err) {
          // ignore — we'll fall back to minimal user
        }
      }

      if (!authUser) {
        authUser = {
          userId: 0,
          fullName: email,
          email,
          role: selectedRole || "STUDENT",
        }
        toast.warning(
          "Login returned a token but no user info was available. Please ensure backend returns user data on login or exposes /auth/me."
        )
      }

      login(token, authUser)
      toast.success("Login successful!")
      router.push(`/${authUser.role.toLowerCase()}`)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials."
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
      >
        <GraduationCap className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold">AdmitFlow</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            {selectedRole
              ? `Sign in to your ${selectedRole.toLowerCase()} account`
              : "Sign in to your account to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: "" }))
                }}
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password)
                      setErrors((prev) => ({ ...prev, password: "" }))
                  }}
                  autoComplete="current-password"
                  className="pr-10"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link
              href={
                selectedRole
                  ? `/register?role=${selectedRole}`
                  : "/register"
              }
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
