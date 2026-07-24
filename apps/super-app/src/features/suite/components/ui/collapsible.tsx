"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

import { cn } from "@/features/suite/utils/classnames";

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  );
}

function CollapsibleContent({
  className,
  children,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        "grid transition-[grid-template-rows] duration-200 data-[closed]:grid-rows-[0fr] data-[open]:grid-rows-[1fr]",
        className
      )}
      {...props}
    >
      <div className="gap-v1-structural-content-tight grid overflow-hidden">
        {children}
      </div>
    </CollapsiblePrimitive.Panel>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
