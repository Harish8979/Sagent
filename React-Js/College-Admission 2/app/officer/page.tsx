"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getAllApplications } from "@/lib/api"
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
  Clock,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  Eye,
} from "lucide-react"
import type { Application } from "@/lib/types"

export default function OfficerDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllApplications()
        setApplications(data)
      } catch {
        // empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <PageLoading />

  const total = applications.length
  const pending = applications.filter(
    (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW"
  ).length
  const approved = applications.filter((a) => a.status === "APPROVED").length
  const rejected = applications.filter((a) => a.status === "REJECTED").length

  const summaryCards = [
    {
      label: "Total Applications",
      value: total,
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

  const recentPending = applications
    .filter((a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW")
    .slice(0, 10)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Officer Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {user?.fullName?.split(" ")[0]}. Here is an overview
            of all applications.
          </p>
        </div>
        <Link href="/officer/review">
          <Button>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Review Queue
          </Button>
        </Link>
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

      {/* Pending Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Applications</CardTitle>
            <CardDescription>
              Applications awaiting your review.
            </CardDescription>
          </div>
          <Link href="/officer/applications">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentPending.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-success/40" />
              <p className="font-medium text-foreground">All caught up!</p>
              <p className="text-sm text-muted-foreground">
                No pending applications to review.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">App Number</th>
                    <th className="pb-3 pr-4 font-medium">Student</th>
                    <th className="pb-3 pr-4 font-medium">Course</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Submitted</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPending.map((app) => (
                    <tr
                      key={app.applicationId}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 pr-4 font-mono text-sm">
                        {app.applicationNumber}
                      </td>
                      <td className="py-3 pr-4 text-sm text-foreground">
                        {app.student?.user?.fullName || "N/A"}
                      </td>
                      <td className="py-3 pr-4 text-sm text-foreground">
                        {app.course?.courseName || "N/A"}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3 pr-4 text-sm text-muted-foreground">
                        {app.submittedAt
                          ? new Date(app.submittedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3">
                        <Link href={`/officer/review/${app.applicationId}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-1 h-4 w-4" />
                            Review
                          </Button>
                        </Link>
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
