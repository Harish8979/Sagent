"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageLoading } from "@/components/loading"

export default function OfficerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !hasRole("OFFICER"))) {
      router.replace("/login?role=OFFICER")
    }
  }, [isAuthenticated, isLoading, hasRole, router])

  if (isLoading) return <PageLoading />
  if (!isAuthenticated || !hasRole("OFFICER")) return <PageLoading />

  return <DashboardLayout>{children}</DashboardLayout>
}
