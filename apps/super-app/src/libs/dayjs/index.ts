// oxlint-disable-next-line unicorn/prefer-export-from -- dayjs.extend() calls below need the local binding; can't collapse to a re-export.
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isLeapYear from "dayjs/plugin/isLeapYear";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekYear from "dayjs/plugin/weekYear";

dayjs.extend(utc);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(isLeapYear);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isoWeek);
dayjs.extend(isBetween);

export default dayjs;
