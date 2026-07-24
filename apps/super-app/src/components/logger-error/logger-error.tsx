"use client";

import { useEffect, useRef } from "react";

import type { TLoggerErrorProps } from "@/components/logger-error/types";
import { Logger } from "@/utils/commons/logger";

export default function LoggerError(props: TLoggerErrorProps) {
  const { error, namespace } = props;
  const logger = useRef<Logger>(new Logger(namespace));

  useEffect(() => {
    logger.current.sendError(error);
  }, [error]);

  return null;
}
