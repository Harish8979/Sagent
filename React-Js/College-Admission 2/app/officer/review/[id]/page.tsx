"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  getApplicationById,
  startReview,
  approveApplication,
  rejectApplication,
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
  CheckCircle2,
  XCircle,
  User,
  BookOpen,
  FileText,
  ExternalLink,
  PlayCircle,
  GraduationCap,
} from "lucide-react"
import type { Application, Document } from "@/lib/types"

export default function ReviewDetailPage({
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
          // no docs
        }
      } catch {
        toast.error("Failed to load application")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleStartReview() {
    if (!application) return
    setSubmitting(true)
    try {
      const updated = await startReview(application.applicationId)
      setApplication(updated)
      toast.success("Application marked as under review")
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start review"
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleApprove() {
    if (!application) return
    setSubmitting(true)
    try {
      const updated = await approveApplication(application.applicationId)
      setApplication(updated)
      toast.success("Application approved!")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Approval failed")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReject() {
    if (!application) return
    setSubmitting(true)
    try {
      const updated = await rejectApplication(application.applicationId)
      setApplication(updated)
      toast.success("Application rejected")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Rejection failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoading />

  if (!application) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-muted-foreground">Application not found</p>
        <Link href="/officer/review">
          <Button variant="outline">Back to Queue</Button>
        </Link>
      </div>
    )
  }

  const canStartReview = application.status === "SUBMITTED"
  const canDecide = application.status === "UNDER_REVIEW"
  const canAct = canStartReview || canDecide

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/officer/review">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            Review {application.applicationNumber}
          </h1>
          <p className="text-muted-foreground">
            Review the application details and make a decision.
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="flex flex-col gap-6">
        {/* Student Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">
                  {application.student?.user?.fullName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">
                  {application.student?.user?.email || "N/A"}
                </p>
              </div>
              {application.student?.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">
                    {application.student.phone}
                  </p>
                </div>
              )}
              {application.student?.dob && (
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium text-foreground">
                    {application.student.dob}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Academic Info */}
        {application.student && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Academic Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {application.student.previousEducation && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Previous Education
                    </p>
                    <p className="font-medium text-foreground">
                      {application.student.previousEducation}
                    </p>
                  </div>
                )}
                {application.student.marksPercentage !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Marks Percentage
                    </p>
                    <p className="font-medium text-foreground">
                      {application.student.marksPercentage}%
                    </p>
                  </div>
                )}
                {application.student.passingYear && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Passing Year
                    </p>
                    <p className="font-medium text-foreground">
                      {application.student.passingYear}
                    </p>
                  </div>
                )}
                {application.student.boardUniversity && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Board / University
                    </p>
                    <p className="font-medium text-foreground">
                      {application.student.boardUniversity}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course & Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="font-medium text-foreground">
                  {application.course?.courseName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Course Code</p>
                <p className="font-medium text-foreground">
                  {application.course?.courseCode || "N/A"}
                </p>
              </div>
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
                  {application.isPaymentCompleted ? "Paid" : "Unpaid"}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applied On</p>
                <p className="text-sm font-medium text-foreground">
                  {application.appliedAt
                    ? new Date(application.appliedAt).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted On</p>
                <p className="text-sm font-medium text-foreground">
                  {application.submittedAt
                    ? new Date(application.submittedAt).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Uploaded Documents
            </CardTitle>
            <CardDescription>
              Documents submitted by the applicant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No documents uploaded.
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
                          Uploaded:{" "}
                          {doc.uploadedAt
                            ? new Date(doc.uploadedAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    {doc.filePath && (
                      <a
                        href={`http://localhost:8080/${doc.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="mr-1 h-4 w-4" />
                          View
                        </Button>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Review Actions */}
        {canAct && (
          <Card>
            <CardHeader>
              <CardTitle>Make Decision</CardTitle>
              <CardDescription>
                {canStartReview
                  ? "Start reviewing this application, then approve or reject."
                  : "Approve or reject this application."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                {canStartReview && (
                  <Button
                    variant="outline"
                    onClick={handleStartReview}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                    ) : (
                      <PlayCircle className="mr-2 h-4 w-4" />
                    )}
                    Start Review
                  </Button>
                )}

                {canDecide && (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={submitting}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Reject this application?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            The student will be notified of the rejection.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleReject}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Reject
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={submitting}
                          className="bg-success text-success-foreground hover:bg-success/90"
                        >
                          {submitting ? (
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                          )}
                          Approve
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Approve this application?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            The student will be notified and the next steps will
                            be initiated.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleApprove}>
                            Approve
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
