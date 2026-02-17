"use client"

import { useState, useEffect } from "react"
import {
  getStudentApplications,
  createPayment,
  markPaymentComplete,
} from "@/lib/api"
import { StatusBadge } from "@/components/status-badge"
import { PageLoading, LoadingSpinner } from "@/components/loading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  CreditCard,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import type { Application } from "@/lib/types"

export default function PaymentsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "",
    transactionId: "",
  })
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)

  useEffect(() => {
    loadApplications()
  }, [])

  async function loadApplications() {
    try {
      const studentId = localStorage.getItem("student_id")
      if (studentId) {
        const apps = await getStudentApplications(parseInt(studentId))
        setApplications(apps)
      }
    } catch {
      // empty
    } finally {
      setLoading(false)
    }
  }

  function openPayDialog(appId: number) {
    setSelectedAppId(appId)
    setPaymentForm({
      amount: "",
      paymentMethod: "",
      transactionId: `TXN-${Date.now()}`,
    })
    setPayDialogOpen(true)
  }

  async function handlePay() {
    if (!selectedAppId) return
    if (!paymentForm.amount || !paymentForm.paymentMethod) {
      toast.error("Please fill in all payment details")
      return
    }

    setProcessingId(selectedAppId)
    try {
      await createPayment({
        application: { applicationId: selectedAppId },
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId,
        paymentStatus: "COMPLETED",
      })

      // Also mark payment complete on the application
      await markPaymentComplete(selectedAppId)

      toast.success("Payment completed successfully!")
      setPayDialogOpen(false)
      await loadApplications()
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to process payment"
      )
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) return <PageLoading />

  const submittedApps = applications.filter((a) => a.status !== "DRAFT")

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Payment Status</h1>
        <p className="mt-1 text-muted-foreground">
          Track and manage payments for your applications.
        </p>
      </div>

      {submittedApps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-foreground">
              No submitted applications
            </p>
            <p className="text-sm text-muted-foreground">
              Submit an application first to see payment options.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {submittedApps.map((app) => {
            const isPaid = app.isPaymentCompleted
            const canPay =
              !isPaid &&
              (app.status === "SUBMITTED" ||
                app.status === "UNDER_REVIEW" ||
                app.status === "APPROVED")

            return (
              <Card key={app.applicationId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CreditCard className="h-4 w-4 text-primary" />
                        {app.applicationNumber}
                      </CardTitle>
                      <CardDescription>
                        {app.course?.courseName || "Course application"}
                      </CardDescription>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isPaid
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Application Status
                        </p>
                        <StatusBadge status={app.status} className="mt-1" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Applied On
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {app.appliedAt
                            ? new Date(app.appliedAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {isPaid && (
                      <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <p className="text-sm font-medium text-success">
                          Payment completed successfully
                        </p>
                      </div>
                    )}

                    {canPay && (
                      <Dialog
                        open={
                          payDialogOpen &&
                          selectedAppId === app.applicationId
                        }
                        onOpenChange={(open) => {
                          if (!open) setPayDialogOpen(false)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            onClick={() =>
                              openPayDialog(app.applicationId)
                            }
                            disabled={processingId === app.applicationId}
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Make Payment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Make Payment</DialogTitle>
                            <DialogDescription>
                              Enter payment details for application{" "}
                              {app.applicationNumber}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col gap-4 py-4">
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="amount">Amount</Label>
                              <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={paymentForm.amount}
                                onChange={(e) =>
                                  setPaymentForm((prev) => ({
                                    ...prev,
                                    amount: e.target.value,
                                  }))
                                }
                                placeholder="5000.00"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="method">Payment Method</Label>
                              <Select
                                value={paymentForm.paymentMethod}
                                onValueChange={(v) =>
                                  setPaymentForm((prev) => ({
                                    ...prev,
                                    paymentMethod: v,
                                  }))
                                }
                              >
                                <SelectTrigger id="method">
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CREDIT_CARD">
                                    Credit Card
                                  </SelectItem>
                                  <SelectItem value="DEBIT_CARD">
                                    Debit Card
                                  </SelectItem>
                                  <SelectItem value="NET_BANKING">
                                    Net Banking
                                  </SelectItem>
                                  <SelectItem value="UPI">UPI</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="txnId">Transaction ID</Label>
                              <Input
                                id="txnId"
                                value={paymentForm.transactionId}
                                onChange={(e) =>
                                  setPaymentForm((prev) => ({
                                    ...prev,
                                    transactionId: e.target.value,
                                  }))
                                }
                                placeholder="TXN-123456"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setPayDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handlePay}
                              disabled={processingId !== null}
                            >
                              {processingId !== null ? (
                                <>
                                  <LoadingSpinner className="mr-2 h-4 w-4" />
                                  Processing...
                                </>
                              ) : (
                                "Confirm Payment"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
