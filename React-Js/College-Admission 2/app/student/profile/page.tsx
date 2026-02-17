"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  createStudent,
  getStudentById,
  updateStudentAcademic,
} from "@/lib/api"
import { PageLoading, LoadingSpinner } from "@/components/loading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { toast } from "sonner"
import { User, Save, GraduationCap } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [studentId, setStudentId] = useState<number | null>(null)
  const [isNewProfile, setIsNewProfile] = useState(false)
  const [formData, setFormData] = useState({
    dob: "",
    gender: "",
    phone: "",
    address: "",
    previousEducation: "",
    marksPercentage: "",
    passingYear: "",
    boardUniversity: "",
  })

  useEffect(() => {
    async function load() {
      const storedStudentId = localStorage.getItem("student_id")
      if (storedStudentId) {
        try {
          const profile = await getStudentById(parseInt(storedStudentId))
          setStudentId(profile.studentId)
          setFormData({
            dob: profile.dob || "",
            gender: profile.gender || "",
            phone: profile.phone || "",
            address: profile.address || "",
            previousEducation: profile.previousEducation || "",
            marksPercentage: profile.marksPercentage?.toString() || "",
            passingYear: profile.passingYear?.toString() || "",
            boardUniversity: profile.boardUniversity || "",
          })
        } catch {
          setIsNewProfile(true)
        }
      } else {
        setIsNewProfile(true)
      }
      setLoading(false)
    }
    load()
  }, [])

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      toast.error("You must be logged in to create or update a profile")
      return
    }

    if (!user.userId || user.userId === 0) {
      toast.error(
        "Authenticated user id is missing. Please log out and sign in again."
      )
      return
    }

    if (!formData.dob) {
      toast.error("Date of Birth is required")
      return
    }

    setSaving(true)
    try {
      if (isNewProfile) {
        // Create new student profile
        const newStudent = await createStudent({
          user: { userId: user.userId },
          dob: formData.dob,
          gender: formData.gender || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          previousEducation: formData.previousEducation || undefined,
          marksPercentage: formData.marksPercentage
            ? parseFloat(formData.marksPercentage)
            : undefined,
          passingYear: formData.passingYear
            ? parseInt(formData.passingYear)
            : undefined,
          boardUniversity: formData.boardUniversity || undefined,
        })
        setStudentId(newStudent.studentId)
        localStorage.setItem(
          "student_id",
          newStudent.studentId.toString()
        )
        setIsNewProfile(false)
        toast.success("Student profile created successfully!")
      } else if (studentId) {
        // Update academic info
        await updateStudentAcademic(studentId, {
          previousEducation: formData.previousEducation,
          marksPercentage: parseFloat(formData.marksPercentage) || 0,
          passingYear: parseInt(formData.passingYear) || 0,
          boardUniversity: formData.boardUniversity,
        })
        toast.success("Academic details updated successfully!")
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save profile"
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoading />

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="mt-1 text-muted-foreground">
          {isNewProfile
            ? "Create your student profile to start applying."
            : "Manage your personal and academic information."}
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your basic contact and personal details.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>Full Name</Label>
              <Input value={user?.fullName || ""} disabled />
              <p className="text-xs text-muted-foreground">
                Name is set from your account registration.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dob">
                Date of Birth <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => updateField("dob", e.target.value)}
                disabled={!isNewProfile}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(v) => updateField("gender", v)}
                disabled={!isNewProfile}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+91 98765 43210"
                disabled={!isNewProfile}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="City, State"
                disabled={!isNewProfile}
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Academic Information
            </CardTitle>
            <CardDescription>
              Your educational background and academic details.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="prevEdu">Previous Education</Label>
              <Input
                id="prevEdu"
                value={formData.previousEducation}
                onChange={(e) =>
                  updateField("previousEducation", e.target.value)
                }
                placeholder="e.g., 12th Science, Diploma"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="marks">Marks Percentage</Label>
              <Input
                id="marks"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.marksPercentage}
                onChange={(e) =>
                  updateField("marksPercentage", e.target.value)
                }
                placeholder="85.5"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="year">Passing Year</Label>
              <Input
                id="year"
                type="number"
                min="1990"
                max="2030"
                value={formData.passingYear}
                onChange={(e) => updateField("passingYear", e.target.value)}
                placeholder="2025"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="board">Board / University</Label>
              <Input
                id="board"
                value={formData.boardUniversity}
                onChange={(e) =>
                  updateField("boardUniversity", e.target.value)
                }
                placeholder="CBSE / State Board / University Name"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                {isNewProfile ? "Creating Profile..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isNewProfile ? "Create Profile" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
