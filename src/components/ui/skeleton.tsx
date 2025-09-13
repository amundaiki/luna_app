import { cn } from "@/src/utils/cn";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div 
      className={cn(
        "skeleton rounded-[var(--radius-md)] bg-[var(--color-neutral-light)] animate-pulse",
        className
      )} 
    />
  );
}

export function LeadCardSkeleton() {
  return (
    <div className="card-base p-[var(--spacing-md)] animate-fade-in">
      <div className="mb-[var(--spacing-sm)] flex items-center justify-between gap-[var(--spacing-sm)]">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-3 flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function DashboardMetricSkeleton() {
  return (
    <div className="card-base p-[var(--spacing-md)] animate-fade-in">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export function LoadingSpinner({ size = "md", className = "" }: { 
  size?: "sm" | "md" | "lg"; 
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div 
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
        sizeClasses[size],
        className
      )}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Laster...
      </span>
    </div>
  );
}


