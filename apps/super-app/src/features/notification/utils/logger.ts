type LogLevel = "info" | "warn" | "error";

export function logger(level: LogLevel, ...args: unknown[]) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const prefix = `[${level.toUpperCase()}]`;

  switch (level) {
    case "warn": {
      console.warn(prefix, ...args);
      break;
    }
    case "error": {
      console.error(prefix, ...args);
      break;
    }
    default: {
      console.log(prefix, ...args);
    }
  }
}
