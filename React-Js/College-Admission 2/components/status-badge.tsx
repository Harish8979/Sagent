import { cn } from "@/lib/utils"
import type { ApplicationStatus, PaymentStatus } from "@/lib/types"

const statusConfig: Record<
  ApplicationStatus | PaymentStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  SUBMITTED: {
    label: "Submitted",
    className: "bg-primary/10 text-primary",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-warning/10 text-warning",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-success/10 text-success",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive",
  },
  PENDING: {
    label: "Pending",
    className: "bg-warning/10 text-warning",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-success/10 text-success",
  },
  FAILED: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive",
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus | PaymentStatus
  className?: string
}) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-muted text-muted-foreground",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
