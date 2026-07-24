import type { TThreadGroupKeys } from "@/core/models/thread";
import dayjs from "@/libs/dayjs";

export const MILLISECONDS_IN_A_SECOND = 1000;
export const SECONDS_IN_A_MINUTE = 60;
export const MINUTES_IN_AN_HOUR = 60;
export const HOURS_IN_A_DAY = 24;
export const MILLISECONDS_IN_A_DAY =
  MILLISECONDS_IN_A_SECOND *
  SECONDS_IN_A_MINUTE *
  MINUTES_IN_AN_HOUR *
  HOURS_IN_A_DAY;
export const MILLISECONDS_IN_A_WEEK = MILLISECONDS_IN_A_DAY * 7;
export const MILLISECONDS_IN_TWO_WEEKS = MILLISECONDS_IN_A_DAY * 14;

export const formatTimestampToDateString = (timestamp: number): string => {
  if (!Number.isFinite(timestamp)) {
    return "";
  }

  return dayjs.unix(timestamp).format("MMM D, YYYY");
};

export const formatUnixDate = (timestamp?: string) => {
  if (!timestamp) {
    return "";
  }

  const numericTimestamp = Number(timestamp);

  if (!Number.isFinite(numericTimestamp)) {
    return "";
  }

  return formatTimestampToDateString(numericTimestamp);
};

export const getTimeCategory = (createdAt: Date): TThreadGroupKeys => {
  const now = new Date();

  // Set the time of both dates to 0 hours (the start of the day)
  createdAt.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffMillis = now.getTime() - createdAt.getTime();

  if (diffMillis === 0) {
    return "today";
  }
  if (diffMillis === MILLISECONDS_IN_A_DAY) {
    return "yesterday";
  }
  if (diffMillis <= MILLISECONDS_IN_A_WEEK) {
    return "lastWeek";
  }
  if (diffMillis <= MILLISECONDS_IN_TWO_WEEKS) {
    return "twoWeeksAgo";
  }
  return "others";
};

// const getWeeksOfMonth = (): number => {
//   const endOfMonth = dayjs().endOf("month").week();

//   const startOfMonth = dayjs().startOf("month").week();

//   return endOfMonth - startOfMonth;
// };

export const getDurationTimeCompleteSignIn = (time: number): string =>
  time > 40 ? "40+" : `${Math.ceil(time / 10) * 10}`;

export function formatSecondsToReadableTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}m${secs}s`;
}

export function formatToISO8601DateTime(date: string) {
  return date
    .replace(/\.\d+/u, "") // remove microseconds
    .replace(" +0000 UTC", "Z");
}

// const formatTimeDifference = (diff: number): string => {
//   if (diff < 5) {
//     return "just now";
//   }
//   if (diff < 60) {
//     return `${diff} seconds ago`;
//   }
//   if (diff < 3600) {
//     return `${Math.floor(diff / 60)} minutes ago`;
//   }
//   if (diff < 86_400) {
//     return `${Math.floor(diff / 3600)} hours ago`;
//   }
//   if (diff < 2_592_000) {
//     return `${Math.floor(diff / 86_400)} days ago`;
//   }
//   if (diff < 31_536_000) {
//     return `${Math.floor(diff / 2_592_000)} months ago`;
//   }

//   return `${Math.floor(diff / 31_536_000)} years ago`;
// };

// const timeAgo = (input: Date | string | number): string => {
//   const now = new Date();
//   const date = new Date(input);
//   const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // convert to seconds

//   if (Number.isNaN(diff)) {
//     return "";
//   }

//   return formatTimeDifference(diff);
// };

// const timeAgoByUnix = (input: string | number): string => {
//   const now = Math.floor(Date.now() / 1000); // current time in seconds
//   // Parse input as Unix timestamp in seconds
//   const timestamp: number =
//     typeof input === "string" ? Number.parseInt(input, 10) : input;

//   if (Number.isNaN(timestamp)) {
//     return "";
//   }

//   const diff = now - timestamp;

//   if (Number.isNaN(diff) || diff < 0) {
//     return "";
//   }

//   return formatTimeDifference(diff);
// };

/**
 * Formats an ISO date string to a readable format like "September 30, 2025".
 * @param isoString - The ISO date string (e.g., "2025-06-05T07:21:35.162Z")
 * @returns A formatted string like "September 30, 2025"
 */
export function formatReadableDate(isoString: string): string {
  return dayjs(isoString).format("MMMM D, YYYY");
}

// function formatDateToYYYYMMDD(dateString?: string): string {
//   if (!dateString) {
//     return "";
//   }
//   const d = new Date(dateString);
//   if (Number.isNaN(d.getTime())) {
//     return "";
//   }
//   return new Intl.DateTimeFormat("en-CA").format(d);
// }

/**
 * Formats an ISO date string to a short month representation like "Oct 24, 2025".
 * @param isoString - The ISO date string (e.g., "2025-10-24T07:30:11.393546Z")
 * @returns A formatted string like "Oct 24, 2025"
 */
export function formatIsoToShortMonthDate(isoString: string): string {
  if (!isoString) {
    return "";
  }

  const date = dayjs(isoString);

  if (!date.isValid()) {
    return "";
  }

  return date.format("MMM D, YYYY");
}

/**
 * Gets the current year in UTC timezone.
 * This ensures consistent year display across all locations.
 * @returns The current year as a number
 */
export function getCurrentYear(): number {
  return dayjs().utc().year();
}

export function toUnixMs(isoString: string): number {
  return new Date(isoString).getTime();
}
