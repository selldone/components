import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import type {
  IRawData,
  TimeSeries,
} from "@selldone/core-js/timeserie/TimeSeries";

type ReportSeries = Pick<TimeSeries, "offset" | "raw_data"> &
  Partial<Pick<TimeSeries, "days" | "startDate" | "endDate">>;

function recordedDays(timeSeries: ReportSeries, endDate?: Date | null) {
  const selectedEnd =
    timeSeries.endDate ||
    DateConverter.GetEndOfDateBefore(timeSeries.offset || 0);
  const selectedStart =
    timeSeries.startDate ||
    (timeSeries.days
      ? DateConverter.GetStartOfDateBefore(
          (timeSeries.offset || 0) + timeSeries.days,
        )
      : null);
  const end = endDate === undefined ? selectedEnd : endDate;
  const days = new Map<number, { date: Date; row: IRawData }>();
  if (
    !end ||
    !selectedEnd ||
    !Number.isFinite(end.getTime()) ||
    !Number.isFinite(selectedEnd.getTime())
  )
    return [];

  for (const row of timeSeries.raw_data || []) {
    const date = DateConverter.convertToLocalTime(row.created_at, true);
    if (
      !date ||
      !Number.isFinite(date.getTime()) ||
      date > end ||
      date > selectedEnd ||
      (selectedStart && date <= selectedStart)
    )
      continue;
    // Match TimeSeries and the response contract: retain the first row for each date.
    if (!days.has(date.getTime())) days.set(date.getTime(), { date, row });
  }
  return [...days.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getReportSnapshot(timeSeries: ReportSeries) {
  const days = recordedDays(timeSeries);
  const latest = days.at(-1);
  const previousDate =
    latest && DateConverter.GetStartOfDateBefore(1, latest.date);
  return {
    current: latest?.row || null,
    previous:
      days.find(({ date }) => date.getTime() === previousDate?.getTime())
        ?.row || null,
  };
}

export function getPeriodComparison(
  timeSeries: ReportSeries,
  readValue: (row: IRawData) => number | null | undefined,
  endDate?: Date | null,
) {
  const days = recordedDays(timeSeries, endDate);
  const values: number[] = [];
  let previousDate: Date | null = null;
  for (const { date, row } of days.reverse()) {
    if (previousDate && date.getTime() !== previousDate.getTime()) break;
    const value = readValue(row);
    if (typeof value !== "number" || !Number.isFinite(value)) break;
    values.unshift(value);
    previousDate = DateConverter.GetStartOfDateBefore(1, date);
  }
  const periodDays = Math.floor(values.length / 2);
  const current = periodDays
    ? values.slice(-periodDays).reduce((sum, value) => sum + value, 0)
    : null;
  const previous = periodDays
    ? values
        .slice(-2 * periodDays, -periodDays)
        .reduce((sum, value) => sum + value, 0)
    : null;
  const available =
    current !== null &&
    previous !== null &&
    Number.isFinite(current) &&
    Number.isFinite(previous);
  const change = available ? current - previous : null;

  return {
    available,
    days: periodDays,
    current,
    previous,
    change,
    value: !available
      ? null
      : previous === 0
        ? current === 0
          ? 0
          : null
        : (100 * (current - previous)) / Math.abs(previous),
    new_activity: available && previous === 0 && current !== 0,
  };
}
