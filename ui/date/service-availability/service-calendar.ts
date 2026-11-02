// Civil dates stay date-only; UTC noon avoids browser time-zone and DST shifts.
export function serviceDateKey(value: unknown): string | null {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return null;
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);
  if (!match) return null;
  const key = match[0].slice(0, 10);
  const date = new Date(`${key}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === key ? key : null;
}

export function addServiceDays(key: string, days: number): string {
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function serviceDateRange(first: string, last: string): string[] {
  if (!serviceDateKey(first) || !serviceDateKey(last)) return [];
  const start = first < last ? first : last;
  const end = first < last ? last : first;
  const count = Math.round((Date.parse(`${end}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86400000);
  return Array.from({ length: count + 1 }, (_, day) => addServiceDays(start, day));
}

export function serviceCalendarMonth(anchor: string, calendar: "gregory" | "persian", offset = 0) {
  const formatter = new Intl.DateTimeFormat("en-US", { calendar, day: "numeric", timeZone: "UTC" });
  const day = (key: string) => Number(formatter.formatToParts(new Date(`${key}T12:00:00Z`)).find((part) => part.type === "day")!.value);
  let start = addServiceDays(anchor, 1 - day(anchor));
  for (let index = 0; index < Math.abs(offset); index++) {
    const adjacent = addServiceDays(start, offset > 0 ? 32 : -1);
    start = addServiceDays(adjacent, 1 - day(adjacent));
  }
  const next = addServiceDays(start, 32);
  const end = addServiceDays(next, -day(next));
  return { start, end, dates: serviceDateRange(start, end) };
}
