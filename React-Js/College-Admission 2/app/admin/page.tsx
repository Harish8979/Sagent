"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getAllApplications, getCourses } from "@/lib/api"
import { PageLoading } from "@/components/loading"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Users,
  FileText,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BarChart3,
  Settings,
} from "lucide-react"

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalCourses: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [apps, courses] = await Promise.all([
          getAllApplications().catch(() => []),
          getCourses().catch(() => []),
        ])
        setStats({
          totalApplications: apps.length,
          pendingApplications: apps.filter(
            (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW"
          ).length,
          approvedApplications: apps.filter((a) => a.status === "APPROVED")
            .length,
          rejectedApplications: apps.filter((a) => a.status === "REJECTED")
            .length,
          totalCourses: courses.length,
        })
      } catch {
        // fallback
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <PageLoading />

  const cards = [
    {
      label: "Total Applications",
      value: stats.totalApplications,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending Review",
      value: stats.pendingApplications,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Approved",
      value: stats.approvedApplications,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Rejected",
      value: stats.rejectedApplications,
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "text-chart-5",
      bg: "bg-chart-5/10",
    },
  ]

  const quickLinks = [
    {
      label: "Manage Courses",
      description: "Add, update, and remove courses",
      href: "/admin/courses",
      icon: BookOpen,
    },
    {
      label: "View Statistics",
      description: "Detailed application analytics",
      href: "/admin/statistics",
      icon: BarChart3,
    },
    {
      label: "Settings",
      description: "System configuration and database reset",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          System overview and management tools, {user?.fullName?.split(" ")[0]}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bg}`}
              >
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Management
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickLinks.map((link) => (
            <Link key={link.label} href={link.href} className="group">
              <Card className="h-full transition-all hover:border-primary/30 hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <link.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{link.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary transition-all group-hover:gap-2">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
