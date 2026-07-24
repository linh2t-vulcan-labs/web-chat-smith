import { Loader2Icon } from "lucide-react";

import { cn } from "@/components/utils/cn";

interface TSpinner extends React.ComponentProps<"svg"> {
  size?: number;
}

export default function Spinner({ className, size = 24, ...props }: TSpinner) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      size={size}
      className={cn("animate-spin", className)}
      {...props}
    />
  );
}
