import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer bg-gradient-to-r from-white/[0.02] via-white/[0.06] to-white/[0.02] bg-[length:200%_100%] rounded-md',
        className
      )}
      {...props}
    />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass p-6 rounded-[var(--radius-xl)] space-y-4", className)}>
      <div className="flex justify-between items-start">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-1/2" />
      <div className="pt-4">
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  )
}
