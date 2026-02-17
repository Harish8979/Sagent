"use client"

import { useState, useEffect } from "react"
import { getCourses, createCourse } from "@/lib/api"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { BookOpen, Plus, GraduationCap, Clock, Users } from "lucide-react"
import type { Course } from "@/lib/types"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    courseCode: "",
    courseName: "",
    durationYears: "",
    totalSeats: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadCourses()
  }, [])

  async function loadCourses() {
    try {
      const data = await getCourses()
      setCourses(data)
    } catch {
      // empty
    } finally {
      setLoading(false)
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!form.courseCode.trim()) newErrors.courseCode = "Course code is required"
    if (!form.courseName.trim()) newErrors.courseName = "Course name is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleCreate() {
    if (!validate()) return
    setSaving(true)
    try {
      const newCourse = await createCourse({
        courseCode: form.courseCode.trim(),
        courseName: form.courseName.trim(),
        durationYears: form.durationYears ? parseInt(form.durationYears) : undefined,
        totalSeats: form.totalSeats ? parseInt(form.totalSeats) : undefined,
      })
      setCourses((prev) => [...prev, newCourse])
      setForm({ courseCode: "", courseName: "", durationYears: "", totalSeats: "" })
      setDialogOpen(false)
      toast.success("Course created successfully!")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create course")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoading />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Course Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage available courses for admissions.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>
                Create a new course for the admission system.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="code">
                  Course Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  value={form.courseCode}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, courseCode: e.target.value }))
                    if (errors.courseCode)
                      setErrors((p) => ({ ...p, courseCode: "" }))
                  }}
                  placeholder="CS101"
                  aria-invalid={!!errors.courseCode}
                />
                {errors.courseCode && (
                  <p className="text-sm text-destructive">{errors.courseCode}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">
                  Course Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={form.courseName}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, courseName: e.target.value }))
                    if (errors.courseName)
                      setErrors((p) => ({ ...p, courseName: "" }))
                  }}
                  placeholder="Computer Science"
                  aria-invalid={!!errors.courseName}
                />
                {errors.courseName && (
                  <p className="text-sm text-destructive">
                    {errors.courseName}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="duration">Duration (years)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="10"
                    value={form.durationYears}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        durationYears: e.target.value,
                      }))
                    }
                    placeholder="4"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="seats">Total Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    value={form.totalSeats}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        totalSeats: e.target.value,
                      }))
                    }
                    placeholder="60"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  "Create Course"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-foreground">No courses yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first course to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.courseId}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {course.courseName}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {course.courseCode}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm">
                  {course.durationYears && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {course.durationYears} year(s)
                    </div>
                  )}
                  {course.totalSeats && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {course.totalSeats} seats
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
