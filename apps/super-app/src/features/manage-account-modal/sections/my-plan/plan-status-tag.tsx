import { Badge } from "@/components/badge-ds";
import { compositeStyles } from "@/utils/commons/styles";

import type { TPlanStatusTagColor, TPlanStatusTagProps } from "./types";

const tagColor: Record<TPlanStatusTagColor, string> = {
  green: "bg-v1-badge-active-background text-v1-badge-active-text",
  neutral: "bg-v1-badge-expired-background text-v1-badge-expired-text",
  red: "bg-v1-badge-canceled-background text-v1-badge-canceled-text",
};

export function PlanStatusTag(props: TPlanStatusTagProps) {
  const { color, label, className, size = "md" } = props;

  return (
    <Badge.Info
      className={compositeStyles("w-fit", tagColor[color], className)}
      size={size}
    >
      {label}
    </Badge.Info>
  );
}
