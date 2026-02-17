import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("h-6 w-6 animate-spin text-primary", className)}
    />
  )
}

export function PageLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner className="h-10 w-10" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
