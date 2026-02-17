"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCourses, createApplication, submitApplication } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { LoadingSpinner, PageLoading } from "@/components/loading"
import { toast } from "sonner"
import { BookOpen, Send, Save, ArrowLeft } from "lucide-react"
import type { Course } from "@/lib/types"
import Link from "next/link"

function generateAppNumber(): string {
  const prefix = "APP"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}-${timestamp}-${random}`
}

export default function ApplyPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [applicationNumber, setApplicationNumber] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setApplicationNumber(generateAppNumber())
    async function load() {
      try {
        const data = await getCourses()
        setCourses(data)
      } catch {
        // API not connected
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!selectedCourse) newErrors.course = "Please select a course"
    if (!applicationNumber.trim())
      newErrors.applicationNumber = "Application number is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSaveDraft() {
    if (!validate()) return
    const studentId = localStorage.getItem("student_id")
    if (!studentId) {
      toast.error(
        "Student profile not found. Please complete your profile first."
      )
      router.push("/student/profile")
      return
    }

    setSubmitting(true)
    try {
      await createApplication({
        studentId: parseInt(studentId),
        courseId: parseInt(selectedCourse),
        applicationNumber,
      })
      toast.success("Application saved as draft!")
      router.push("/student/applications")
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save application"
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit() {
    if (!validate()) return
    const studentId = localStorage.getItem("student_id")
    if (!studentId) {
      toast.error(
        "Student profile not found. Please complete your profile first."
      )
      router.push("/student/profile")
      return
    }

    setSubmitting(true)
    try {
      const app = await createApplication({
        studentId: parseInt(studentId),
        courseId: parseInt(selectedCourse),
        applicationNumber,
      })
      await submitApplication(app.applicationId)
      toast.success("Application submitted successfully!")
      router.push("/student/applications")
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit application"
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoading />

  const selectedCourseData = courses.find(
    (c) => c.courseId.toString() === selectedCourse
  )

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/student/applications">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            New Application
          </h1>
          <p className="text-muted-foreground">
            Fill in the details to apply for admission.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Application Number */}
        <Card>
          <CardHeader>
            <CardTitle>Application Number</CardTitle>
            <CardDescription>
              A unique identifier for your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Label htmlFor="appNumber">Application Number</Label>
              <Input
                id="appNumber"
                value={applicationNumber}
                onChange={(e) => {
                  setApplicationNumber(e.target.value)
                  if (errors.applicationNumber)
                    setErrors((prev) => ({ ...prev, applicationNumber: "" }))
                }}
                placeholder="APP-123456-001"
                aria-invalid={!!errors.applicationNumber}
              />
              {errors.applicationNumber && (
                <p className="text-sm text-destructive">
                  {errors.applicationNumber}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Course Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Course Selection
            </CardTitle>
            <CardDescription>
              Choose the course you want to apply for.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="course">Course</Label>
              <Select
                value={selectedCourse}
                onValueChange={(v) => {
                  setSelectedCourse(v)
                  if (errors.course)
                    setErrors((prev) => ({ ...prev, course: "" }))
                }}
              >
                <SelectTrigger id="course" aria-invalid={!!errors.course}>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No courses available
                    </SelectItem>
                  ) : (
                    courses.map((course) => (
                      <SelectItem
                        key={course.courseId}
                        value={course.courseId.toString()}
                      >
                        {course.courseCode} - {course.courseName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.course && (
                <p className="text-sm text-destructive">{errors.course}</p>
              )}
            </div>

            {/* Course details */}
            {selectedCourseData && (
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h4 className="font-medium text-foreground">
                  {selectedCourseData.courseName}
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Code: {selectedCourseData.courseCode}
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  {selectedCourseData.durationYears && (
                    <span className="text-muted-foreground">
                      Duration:{" "}
                      <span className="font-medium text-foreground">
                        {selectedCourseData.durationYears} year(s)
                      </span>
                    </span>
                  )}
                  {selectedCourseData.totalSeats && (
                    <span className="text-muted-foreground">
                      Total Seats:{" "}
                      <span className="font-medium text-foreground">
                        {selectedCourseData.totalSeats}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={submitting}
          >
            {submitting ? (
              <LoadingSpinner className="mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save as Draft
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={submitting || !selectedCourse}>
                <Send className="mr-2 h-4 w-4" />
                Submit Application
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Application?</AlertDialogTitle>
                <AlertDialogDescription>
                  Once submitted, you cannot make changes to this application.
                  Make sure all details are correct before proceeding.
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
      </div>
    </div>
  )
}
