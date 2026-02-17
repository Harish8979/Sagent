"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle, AlertCircle, Eye } from "lucide-react"
import type { Application, ApplicationStatus } from "@/lib/types"

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  useEffect(() => {
    async function load() {
      try {
        const studentId = localStorage.getItem("student_id")
        if (studentId) {
          const data = await getStudentApplications(parseInt(studentId))
          setApplications(data)
        }
      } catch {
        // empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <PageLoading />

  const filtered =
    statusFilter === "ALL"
      ? applications
      : applications.filter((a) => a.status === statusFilter)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            My Applications
          </h1>
          <p className="mt-1 text-muted-foreground">
            View and manage all your admission applications.
          </p>
        </div>
        <Link href="/student/apply">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Filter by status:
        </span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Application List */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filtered.length})</CardTitle>
          <CardDescription>
            Click on an application to view its details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium text-foreground">
                {statusFilter === "ALL"
                  ? "No applications found"
                  : `No ${statusFilter.toLowerCase().replace("_", " ")} applications`}
              </p>
              <Link href="/student/apply">
                <Button variant="outline" size="sm">
                  Create Application
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
                    <th className="pb-3 pr-4 font-medium">Applied</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => (
                    <tr
                      key={app.applicationId}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 pr-4 font-mono text-sm text-foreground">
                        {app.applicationNumber}
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
                      <td className="py-3 pr-4 text-sm text-muted-foreground">
                        {app.appliedAt
                          ? new Date(app.appliedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/student/applications/${app.applicationId}`}
                        >
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-1 h-4 w-4" />
                            View
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
