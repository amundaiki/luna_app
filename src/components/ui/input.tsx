import * as React from "react";
import { cn } from "@/src/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";


