"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  ArrowRight,
  Users,
  Shield,
  FileText,
  CheckCircle2,
  Clock,
  BookOpen,
} from "lucide-react"

const roles = [
  {
    title: "Student",
    description:
      "Apply for admission, upload documents, and track your application status.",
    href: "/login?role=STUDENT",
    icon: GraduationCap,
    features: [
      "Submit applications",
      "Upload documents",
      "Track status",
      "Make payments",
    ],
  },
  {
    title: "Admission Officer",
    description:
      "Review applications, manage documents, and process admissions efficiently.",
    href: "/login?role=OFFICER",
    icon: Users,
    features: [
      "Review applications",
      "Approve/Reject",
      "View documents",
      "Manage queue",
    ],
  },
  {
    title: "Administrator",
    description:
      "Manage users, courses, and system settings with full administrative control.",
    href: "/login?role=ADMIN",
    icon: Shield,
    features: [
      "Manage users",
      "Manage courses",
      "View statistics",
      "System settings",
    ],
  },
]

const stats = [
  { label: "Applications Processed", value: "12,000+", icon: FileText },
  { label: "Acceptance Rate", value: "78%", icon: CheckCircle2 },
  { label: "Avg. Review Time", value: "3 Days", icon: Clock },
  { label: "Courses Available", value: "150+", icon: BookOpen },
]

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(`/${user.role.toLowerCase()}`)
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold text-foreground">
              AdmitFlow
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8 lg:py-28">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-success" />
            Admissions Open for 2026
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            College Admission Management Made Simple
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Streamline your entire admission process. From application
            submission to final approval, manage everything in one unified
            platform.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start Application
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 bg-card px-6 py-8"
            >
              <stat.icon className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {stat.value}
              </span>
              <span className="text-center text-sm text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Role cards */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground">
              Choose Your Portal
            </h2>
            <p className="mt-3 text-muted-foreground">
              Select your role to access the right tools and features.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {roles.map((role) => (
              <Link key={role.title} href={role.href} className="group">
                <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <role.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {role.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {role.description}
                  </p>
                  <ul className="mt-4 flex flex-col gap-2">
                    {role.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-all group-hover:gap-2">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-8 lg:px-8">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              AdmitFlow
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            2026 College Admission Management System
          </p>
        </div>
      </footer>
    </div>
  )
}
