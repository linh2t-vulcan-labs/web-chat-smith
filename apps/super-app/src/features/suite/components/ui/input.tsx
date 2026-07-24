import { Input as InputPrimitive } from "@base-ui/react/input";
import * as React from "react";

import { cn } from "@/features/suite/utils/classnames";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "border-inputfile:text-heading-scale-0 file:text-foreground placeholder:text-muted-foreground disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3",
        className
      )}
      {...props}
    />
  );
}

export { Input };
