import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/utils/cn";

const buttonVariants = cva(
  "button-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:scale-95",
        secondary:
          "bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-hover)] active:scale-95",
        success:
          "bg-[var(--color-success)] text-white hover:bg-[var(--color-success-hover)] active:scale-95",
        warning:
          "bg-[var(--color-warning)] text-white hover:bg-[var(--color-warning-hover)] active:scale-95",
        error:
          "bg-[var(--color-error)] text-white hover:bg-[var(--color-error-hover)] active:scale-95",
        outline:
          "border border-black/10 bg-transparent hover:bg-[var(--color-neutral-light)] text-foreground",
        ghost: "bg-transparent hover:bg-[var(--color-neutral-light)]",
      },
      size: {
        sm: "h-9 px-3 text-sm min-w-[2.5rem]",
        md: "h-10 px-4 text-sm min-w-[3rem]",
        lg: "h-11 px-6 text-base min-w-[3.5rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}


