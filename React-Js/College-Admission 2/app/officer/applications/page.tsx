"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getAllApplications } from "@/lib/api"
import { StatusBadge } from "@/components/status-badge"
import { PageLoading } from "@/components/loading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Eye, Search } from "lucide-react"
import type { Application } from "@/lib/types"

export default function OfficerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [search, setSearch] = useState("")

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

  const filtered = applications
    .filter((a) => statusFilter === "ALL" || a.status === statusFilter)
    .filter(
      (a) =>
        !search ||
        a.student?.user?.fullName
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        a.applicationNumber.toLowerCase().includes(search.toLowerCase()) ||
        a.course?.courseName?.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          All Applications
        </h1>
        <p className="mt-1 text-muted-foreground">
          Browse and filter all student applications.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student, course, or app number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filtered.length})</CardTitle>
          <CardDescription>
            {"Click \"Review\" to view details and make a decision."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No applications match your filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">App Number</th>
                    <th className="pb-3 pr-4 font-medium">Student</th>
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 pr-4 font-medium">Course</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Payment</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => (
                    <tr
                      key={app.applicationId}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 pr-4 font-mono text-sm">
                        {app.applicationNumber}
                      </td>
                      <td className="py-3 pr-4 text-sm font-medium text-foreground">
                        {app.student?.user?.fullName || "N/A"}
                      </td>
                      <td className="py-3 pr-4 text-sm text-muted-foreground">
                        {app.student?.user?.email || "N/A"}
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
                      <td className="py-3">
                        <Link
                          href={`/officer/review/${app.applicationId}`}
                        >
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
