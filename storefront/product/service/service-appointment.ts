const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export function getServiceTimezone(outputs) {
  if (typeof outputs?.timezone !== "string" || !outputs.timezone) return null;
  try {
    new Intl.DateTimeFormat("en", { timeZone: outputs.timezone }).format();
    return outputs.timezone;
  } catch {
    return null;
  }
}

export function getAppointmentDate(value) {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return null;
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null;
}

export function getServiceClock(timezone, now = Date.now()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", hourCycle: "h23",
  }).formatToParts(now).map(({ type, value }) => [type, value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

export function getAppointmentHours(outputs, date, now = Date.now()) {
  const timezone = getServiceTimezone(outputs);
  date = getAppointmentDate(date);
  if (!timezone || !date) return [];
  if (Array.isArray(outputs.disabled) && outputs.disabled.some((value) =>
    getAppointmentDate(typeof value === "string" ? value.slice(0, 10) : value) === date,
  )) return [];
  const clock = getServiceClock(timezone, now);
  if (date < clock.date) return [];
  const weekday = WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];
  const hours = outputs.days?.[weekday];
  if (!Array.isArray(hours)) return [];
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  const localParts = (instant) => Object.fromEntries(formatter.formatToParts(instant)
    .map(({ type, value }) => [type, value]));
  const noon = Date.parse(`${date}T12:00:00Z`);
  const offsets = new Set([-86400000, 0, 86400000].map((delta) => {
    const instant = noon + delta;
    const local = localParts(instant);
    return Date.UTC(Number(local.year), Number(local.month) - 1, Number(local.day), Number(local.hour), Number(local.minute)) - instant;
  }));
  const isAvailable = (hour) => {
    if (!Number.isInteger(hour) || hour < 1 || hour > 24) return false;
    const wallTime = Date.parse(`${date}T${String(hour % 24).padStart(2, "0")}:00:00Z`);
    const matches = [...offsets].map((offset) => wallTime - offset).filter((instant) => {
      const local = localParts(instant);
      return `${local.year}-${local.month}-${local.day}` === date && Number(local.hour) === hour % 24 && Number(local.minute) === 0;
    });
    // Skip nonexistent or ambiguous DST hours; the server remains authoritative.
    return matches.length === 1 && matches[0] > now;
  };
  return [...new Set(hours.filter(isAvailable))].sort((a, b) => a % 24 - b % 24);
}

export function formatAppointmentRequest(appointment, locale) {
  const date = getAppointmentDate(appointment?.date);
  const hour = appointment?.hour;
  if (!date || !Number.isInteger(hour) || hour < 1 || hour > 24) return null;
  // Native hour 24 is midnight on the selected date, not the following date.
  const instant = new Date(`${date}T${String(hour % 24).padStart(2, "0")}:00:00Z`);
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC", year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(instant);
}
