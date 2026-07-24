import type { TSkeletonProps } from "@/components/skeleton/types";
import { compositeStyles } from "@/utils/commons/styles";

export default function Skeleton(props: TSkeletonProps) {
  const { className } = props;
  return (
    <div
      className={compositeStyles(
        "bg-v1-surface-glass-dark-breath rounded-v1-pill h-[12px] animate-pulse",
        className
      )}
    />
  );
}
