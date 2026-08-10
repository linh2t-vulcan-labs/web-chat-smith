import { IconLoader } from "@cs/icons/loader";

import { cn } from "#lib/utils";

const Spinner = ({ className, ...props }: React.ComponentProps<"svg">) => (
  <output aria-label="Loading">
    <IconLoader className={cn("size-4 animate-spin", className)} {...props} />
  </output>
);

export { Spinner };
