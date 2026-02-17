"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Upload,
  CreditCard,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ClipboardCheck,
  BarChart3,
  ChevronRight,
  User,
} from "lucide-react"
import type { UserRole } from "@/lib/types"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: Record<UserRole, NavItem[]> = {
  STUDENT: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "My Applications", href: "/student/applications", icon: FileText },
    { label: "New Application", href: "/student/apply", icon: ClipboardCheck },
    { label: "Documents", href: "/student/documents", icon: Upload },
    { label: "Payments", href: "/student/payments", icon: CreditCard },
    { label: "Profile", href: "/student/profile", icon: User },
  ],
  OFFICER: [
    { label: "Dashboard", href: "/officer", icon: LayoutDashboard },
    { label: "Applications", href: "/officer/applications", icon: FileText },
    { label: "Review Queue", href: "/officer/review", icon: ClipboardCheck },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Statistics", href: "/admin/statistics", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
}

const roleLabels: Record<UserRole, string> = {
  STUDENT: "Student Portal",
  OFFICER: "Officer Portal",
  ADMIN: "Admin Portal",
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return null

  const items = navItems[user.role] || []

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <GraduationCap className="h-7 w-7 text-sidebar-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-primary-foreground">
              AdmitFlow
            </span>
            <span className="text-[11px] text-sidebar-foreground/60">
              {roleLabels[user.role]}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto text-sidebar-foreground lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1" role="list">
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== `/${user.role.toLowerCase()}` &&
                  pathname.startsWith(item.href))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-primary-foreground"
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" />
                    {item.label}
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User info */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
              {user.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-sidebar-primary-foreground">
                {user.fullName}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                {user.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-3 w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-primary-foreground"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Welcome, {user.fullName}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {user.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
