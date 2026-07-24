import React from "react";

import { statusBadge, statusDot } from "./consts";
import type { TStatusBadgeProps } from "./types";

function StatusBadge({ className, children, status }: TStatusBadgeProps) {
  return (
    <span className={statusBadge({ className, status })}>
      <span className={statusDot({ status })} />
      {children}
    </span>
  );
}

export default StatusBadge;
