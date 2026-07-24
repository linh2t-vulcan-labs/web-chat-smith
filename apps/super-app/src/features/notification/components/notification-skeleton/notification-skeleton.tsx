import React from "react";

interface NotificationSkeletonProps {
  itemCount?: number;
}

const NotificationSkeleton = ({ itemCount = 3 }: NotificationSkeletonProps) => (
  <div className="flex flex-col">
    {Array.from({ length: itemCount }, (_, index) => (
      <div
        key={index}
        className="border-border-input-default p-medium-2 flex border-t"
      >
        <div className="bg-surface-general-bright-overlay relative size-12 shrink-0 overflow-hidden rounded-full" />

        <div className="gap-small-1 ps-medium-2 flex flex-1 flex-col">
          <div className="bg-surface-general-bright-overlay relative h-3 w-3/4 overflow-hidden rounded-md" />
          <div className="gap-small-1 flex">
            <div className="bg-surface-general-bright-overlay relative h-3 w-3/5 overflow-hidden rounded-md" />
            <div className="bg-surface-general-bright-overlay relative h-3 w-2/5 overflow-hidden rounded-md" />
          </div>

          <div className="gap-small-1 flex">
            <div className="bg-surface-general-bright-overlay relative h-3 w-2/5 overflow-hidden rounded-md" />
            <div className="bg-surface-general-bright-overlay relative h-3 w-3/5 overflow-hidden rounded-md" />
          </div>

          <div className="bg-surface-general-bright-overlay relative h-3 w-4/5 overflow-hidden rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

export default NotificationSkeleton;
