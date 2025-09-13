import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-[var(--duration-fast)]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[var(--color-primary-light)] text-[var(--color-primary)]",
        success: "border-transparent bg-[var(--color-success-light)] text-[var(--color-success)]",
        warning: "border-transparent bg-[var(--color-warning-light)] text-[var(--color-warning)]",
        error: "border-transparent bg-[var(--color-error-light)] text-[var(--color-error)]",
        secondary: "border-transparent bg-[var(--color-secondary-light)] text-[var(--color-secondary)]",
        outline: "border-black/10 text-foreground/80 bg-transparent",
        neutral: "border-transparent bg-[var(--color-neutral-light)] text-[var(--color-neutral)]",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}


