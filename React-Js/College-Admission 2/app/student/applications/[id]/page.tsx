"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  getApplicationById,
  submitApplication,
  getApplicationDocuments,
} from "@/lib/api"
import { StatusBadge } from "@/components/status-badge"
import { PageLoading, LoadingSpinner } from "@/components/loading"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  ArrowLeft,
  Send,
  FileText,
  BookOpen,
} from "lucide-react"
import type { Application, Document } from "@/lib/types"

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [application, setApplication] = useState<Application | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const appData = await getApplicationById(parseInt(id))
        setApplication(appData)
        try {
          const docs = await getApplicationDocuments(parseInt(id))
          setDocuments(docs)
        } catch {
          // no documents yet
        }
      } catch {
        toast.error("Failed to load application details")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleSubmit() {
    if (!application) return
    setSubmitting(true)
    try {
      const updated = await submitApplication(application.applicationId)
      setApplication(updated)
      toast.success("Application submitted!")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoading />

  if (!application) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-muted-foreground">Application not found</p>
        <Link href="/student/applications">
          <Button variant="outline">Back to Applications</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/student/applications">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            Application {application.applicationNumber}
          </h1>
          <p className="text-muted-foreground">
            Application details and status
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="flex flex-col gap-6">
        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={application.status} className="mt-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment</p>
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    application.isPaymentCompleted
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {application.isPaymentCompleted ? "Completed" : "Pending"}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applied On</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {application.appliedAt
                    ? new Date(application.appliedAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {application.submittedAt
                    ? new Date(application.submittedAt).toLocaleDateString()
                    : "Not submitted"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-foreground">
              {application.course?.courseName || "N/A"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Code: {application.course?.courseCode || "N/A"}
            </p>
            <div className="mt-2 flex gap-4 text-sm">
              {application.course?.durationYears && (
                <span className="text-muted-foreground">
                  Duration:{" "}
                  <span className="font-medium text-foreground">
                    {application.course.durationYears} year(s)
                  </span>
                </span>
              )}
              {application.course?.totalSeats && (
                <span className="text-muted-foreground">
                  Total Seats:{" "}
                  <span className="font-medium text-foreground">
                    {application.course.totalSeats}
                  </span>
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Uploaded documents for this application
              </CardDescription>
            </div>
            <Link href="/student/documents">
              <Button variant="outline" size="sm">
                Upload More
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No documents uploaded yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {documents.map((doc) => (
                  <li
                    key={doc.documentId}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {doc.documentType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {doc.uploadedAt
                            ? new Date(doc.uploadedAt).toLocaleDateString()
                            : ""}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {application.status === "DRAFT" && (
          <div className="flex justify-end gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={submitting}>
                  {submitting ? (
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit Application
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Submit this application?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will not be able to edit this application after
                    submission.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>
                    Submit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  )
}
