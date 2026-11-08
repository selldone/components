/*
 * Copyright (c) 2026. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */

import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";

/** The calendar day of a local date as a day count, or null when the value is not a date. */
export function calendarDayNumber(value: unknown): number | null {
  if (value == null) return null;
  const date = DateConverter.convertToLocalTime(value as any);
  if (!date || !Number.isFinite(date.getTime())) return null;
  return (
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
  );
}

/**
 * A report window for two calendar dates, both days included: `offset` days before today
 * to its end and `days` more back to its start. Null unless the end is today or earlier and
 * the start lies within the last `maxDays` days.
 */
export function customRangeWindow(
  start: unknown,
  end: unknown,
  maxDays = 90,
): { offset: number; days: number } | null {
  const first = calendarDayNumber(start);
  const last = calendarDayNumber(end);
  const today = calendarDayNumber(new Date());
  if (
    first == null ||
    last == null ||
    today == null ||
    first > last ||
    first < today - (maxDays - 1) ||
    last > today
  )
    return null;
  return { offset: today - last, days: last - first };
}
