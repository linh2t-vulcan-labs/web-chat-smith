import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { forwardRef } from "react";

import { cn } from "../utils/cn";
import type { IPackageGroupProps } from "./types";

const PackageGroup = forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  IPackageGroupProps
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn(
      "flex flex-col",
      "gap-v1-structural-component-medium",
      className
    )}
    {...props}
  />
));

PackageGroup.displayName = "PackageGroup";

export { PackageGroup };
