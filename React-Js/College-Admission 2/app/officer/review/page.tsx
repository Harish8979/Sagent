"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getAllApplications } from "@/lib/api"
import { StatusBadge } from "@/components/status-badge"
import { PageLoading } from "@/components/loading"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ClipboardCheck } from "lucide-react"
import type { Application } from "@/lib/types"

export default function ReviewQueuePage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllApplications()
        setApplications(
          data.filter(
            (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW"
          )
        )
      } catch {
        // empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <PageLoading />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Review Queue</h1>
        <p className="mt-1 text-muted-foreground">
          Applications pending your review decision.
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <CheckCircle2 className="h-10 w-10 text-success/40" />
            <p className="font-medium text-foreground">Queue is empty</p>
            <p className="text-sm text-muted-foreground">
              All applications have been reviewed. Great work!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {applications.map((app) => (
            <Card
              key={app.applicationId}
              className="transition-all hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    {app.applicationNumber}
                  </CardTitle>
                  <StatusBadge status={app.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {app.course?.courseName || "Course application"}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Student</p>
                    <p className="font-medium text-foreground">
                      {app.student?.user?.fullName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        app.isPaymentCompleted
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {app.isPaymentCompleted ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Submitted</p>
                    <p className="font-medium text-foreground">
                      {app.submittedAt
                        ? new Date(app.submittedAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/officer/review/${app.applicationId}`}
                  className="mt-1"
                >
                  <Button className="w-full" size="sm">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Review Application
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
