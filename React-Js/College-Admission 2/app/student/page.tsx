"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getStudentApplications } from "@/lib/api"
import { StatusBadge } from "@/components/status-badge"
import { PageLoading } from "@/components/loading"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  FileText,
  PlusCircle,
  Upload,
  CreditCard,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
} from "lucide-react"
import type { Application } from "@/lib/types"

export default function StudentDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const studentId = localStorage.getItem("student_id")
        if (studentId) {
          const data = await getStudentApplications(parseInt(studentId))
          setApplications(data)
        }
      } catch {
        // API not connected - show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <PageLoading />

  const approved = applications.filter((a) => a.status === "APPROVED").length
  const pending = applications.filter(
    (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW"
  ).length
  const rejected = applications.filter((a) => a.status === "REJECTED").length

  const summaryCards = [
    {
      label: "Total Applications",
      value: applications.length,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending Review",
      value: pending,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Approved",
      value: approved,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Rejected",
      value: rejected,
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ]

  const quickActions = [
    {
      label: "New Application",
      description: "Start a new admission application",
      href: "/student/apply",
      icon: PlusCircle,
    },
    {
      label: "Upload Documents",
      description: "Upload required documents",
      href: "/student/documents",
      icon: Upload,
    },
    {
      label: "Payment Status",
      description: "Check your payment status",
      href: "/student/payments",
      icon: CreditCard,
    },
    {
      label: "My Profile",
      description: "View and edit your profile",
      href: "/student/profile",
      icon: User,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.fullName?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {"Here's an overview of your admission applications."}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card) => (
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

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href} className="group">
              <Card className="h-full transition-all hover:border-primary/30 hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {action.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary transition-all group-hover:gap-2">
                    Go <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              Your latest admission applications
            </CardDescription>
          </div>
          <Link href="/student/applications">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
              <div>
                <p className="font-medium text-foreground">
                  No applications yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Start your admission journey by creating a new application.
                </p>
              </div>
              <Link href="/student/apply">
                <Button className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Application
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">App Number</th>
                    <th className="pb-3 pr-4 font-medium">Course</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Payment</th>
                    <th className="pb-3 font-medium">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 5).map((app) => (
                    <tr
                      key={app.applicationId}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <Link
                          href={`/student/applications/${app.applicationId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {app.applicationNumber}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-sm text-foreground">
                        {app.course?.courseName || "N/A"}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            app.isPaymentCompleted
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          {app.isPaymentCompleted ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {app.appliedAt
                          ? new Date(app.appliedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
