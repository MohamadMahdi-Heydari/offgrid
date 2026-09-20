import dayjs from "dayjs";
import jalaliday from "jalaliday";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fa";

dayjs.extend(jalaliday);
dayjs.extend(relativeTime);
dayjs.locale("fa");

export function formatRelative(date: string | Date) {
  return dayjs(date).fromNow();
}

export function formatJalali(date: string | Date) {
  return dayjs(date).calendar("jalali").locale("fa").format("YYYY/MM/DD");
}
