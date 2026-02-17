"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageLoading } from "@/components/loading"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !hasRole("ADMIN"))) {
      router.replace("/login?role=ADMIN")
    }
  }, [isAuthenticated, isLoading, hasRole, router])

  if (isLoading) return <PageLoading />
  if (!isAuthenticated || !hasRole("ADMIN")) return <PageLoading />

  return <DashboardLayout>{children}</DashboardLayout>
}
