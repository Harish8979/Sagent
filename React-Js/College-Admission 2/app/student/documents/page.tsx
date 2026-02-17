"use client"

import { useState, useEffect, useRef } from "react"
import {
  getStudentApplications,
  uploadDocument,
  getApplicationDocuments,
} from "@/lib/api"
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
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  File,
} from "lucide-react"
import type { Application, Document as DocType } from "@/lib/types"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]

const DOCUMENT_TYPES = [
  "10th Marksheet",
  "12th Marksheet",
  "ID Proof",
  "Photo",
  "Transfer Certificate",
  "Character Certificate",
  "Caste Certificate",
  "Income Certificate",
  "Other",
]

interface UploadedFile {
  file: File
  progress: number
  status: "pending" | "uploading" | "done" | "error"
  error?: string
}

export default function DocumentsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApp, setSelectedApp] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [existingDocs, setExistingDocs] = useState<DocType[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const studentId = localStorage.getItem("student_id")
        if (studentId) {
          const data = await getStudentApplications(parseInt(studentId))
          setApplications(data)
          if (data.length > 0) {
            setSelectedApp(data[0].applicationId.toString())
          }
        }
      } catch {
        // empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Load existing documents when application is selected
  useEffect(() => {
    async function loadDocs() {
      if (!selectedApp) return
      try {
        const docs = await getApplicationDocuments(parseInt(selectedApp))
        setExistingDocs(docs)
      } catch {
        setExistingDocs([])
      }
    }
    loadDocs()
  }, [selectedApp])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files
    if (!selected) return

    const newFiles: UploadedFile[] = []
    for (const file of Array.from(selected)) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 5MB limit`)
        continue
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`)
        continue
      }
      newFiles.push({ file, progress: 0, status: "pending" })
    }
    setFiles((prev) => [...prev, ...newFiles])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleUpload() {
    if (!selectedApp) {
      toast.error("Please select an application")
      return
    }
    if (!documentType) {
      toast.error("Please select a document type")
      return
    }
    if (files.filter((f) => f.status === "pending").length === 0) {
      toast.error("No files to upload")
      return
    }

    setUploading(true)
    const updatedFiles = [...files]

    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status !== "pending") continue
      updatedFiles[i].status = "uploading"
      setFiles([...updatedFiles])

      try {
        await uploadDocument(
          updatedFiles[i].file,
          parseInt(selectedApp),
          documentType,
          (progress) => {
            updatedFiles[i].progress = progress
            setFiles([...updatedFiles])
          }
        )
        updatedFiles[i].status = "done"
        updatedFiles[i].progress = 100
      } catch {
        updatedFiles[i].status = "error"
        updatedFiles[i].error = "Upload failed"
      }
      setFiles([...updatedFiles])
    }

    setUploading(false)

    const successCount = updatedFiles.filter((f) => f.status === "done").length
    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded successfully!`)
      // Refresh existing docs
      try {
        const docs = await getApplicationDocuments(parseInt(selectedApp))
        setExistingDocs(docs)
      } catch {
        // empty
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const dt = e.dataTransfer
    if (dt.files.length > 0) {
      const fakeEvent = {
        target: { files: dt.files },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(fakeEvent)
    }
  }

  if (loading) return <PageLoading />

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Document Upload
        </h1>
        <p className="mt-1 text-muted-foreground">
          Upload required documents for your application.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Application & Doc Type selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Application</CardTitle>
            <CardDescription>
              Choose the application and document type.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="app-select">Application</Label>
              <Select value={selectedApp} onValueChange={setSelectedApp}>
                <SelectTrigger id="app-select">
                  <SelectValue placeholder="Select an application" />
                </SelectTrigger>
                <SelectContent>
                  {applications.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No applications found
                    </SelectItem>
                  ) : (
                    applications.map((app) => (
                      <SelectItem
                        key={app.applicationId}
                        value={app.applicationId.toString()}
                      >
                        {app.applicationNumber} -{" "}
                        {app.course?.courseName || "Application"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="doc-type">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="doc-type">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Drop Zone */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Supported: PDF, JPEG, PNG, WebP. Max size: 5MB per file.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/40 hover:bg-muted/30"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  fileInputRef.current?.click()
                }
              }}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, JPEG, PNG, WebP up to 5MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload files"
              />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <ul className="flex flex-col gap-2">
                {files.map((f, i) => (
                  <li
                    key={`${f.file.name}-${i}`}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <File className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-foreground">
                        {f.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(f.file.size / 1024).toFixed(1)} KB
                      </p>
                      {f.status === "uploading" && (
                        <Progress value={f.progress} className="mt-2 h-1.5" />
                      )}
                      {f.status === "error" && (
                        <p className="mt-1 text-xs text-destructive">
                          {f.error}
                        </p>
                      )}
                    </div>
                    {f.status === "done" ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                    ) : f.status === "error" ? (
                      <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                    ) : f.status === "pending" ? (
                      <button
                        onClick={() => removeFile(i)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${f.file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}

            {files.filter((f) => f.status === "pending").length > 0 && (
              <Button
                onClick={handleUpload}
                disabled={uploading || !selectedApp || !documentType}
              >
                {uploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload{" "}
                    {files.filter((f) => f.status === "pending").length} file(s)
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Existing documents */}
        {existingDocs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
              <CardDescription>
                Documents already attached to this application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {existingDocs.map((doc) => (
                  <li
                    key={doc.documentId}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {doc.documentType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doc.uploadedAt
                          ? new Date(doc.uploadedAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
