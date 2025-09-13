import { cn } from "@/src/utils/cn";

export function Card({ children, className = "", interactive = true }: { 
  children: React.ReactNode; 
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div className={cn(
      "card-base p-[var(--spacing-md)] animate-fade-in",
      interactive && "hover:card-base",
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-[var(--spacing-sm)] flex items-center justify-between gap-[var(--spacing-sm)]", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("heading-xs text-foreground", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("body-sm text-muted", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "" }: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-[var(--spacing-md)] flex items-center gap-[var(--spacing-sm)]", className)}>
      {children}
    </div>
  );
}


