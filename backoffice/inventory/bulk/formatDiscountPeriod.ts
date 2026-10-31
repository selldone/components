/** Describe selected boundaries without treating an open-ended discount as expired. */
export function formatDiscountPeriod(
  start: Date | string | number | null | undefined,
  end: Date | string | number | null | undefined,
  locale: string,
  translate: (key: string, values: { start: string; end: string }) => string,
) {
  const formatter = new Intl.DateTimeFormat(locale, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const formatDate = (value: typeof start) => {
    if (value === null || value === undefined || value === '') return '';
    const date = new Date(value instanceof Date ? value.getTime() : value);
    return Number.isFinite(date.valueOf()) ? formatter.format(date) : '';
  };
  const values = { start: formatDate(start), end: formatDate(end) };
  const key = values.start ? values.end ? 'schedule_period' : 'schedule_start_only'
    : values.end ? 'schedule_end_only' : 'schedule_no_dates';
  return translate(`inventory_list.bulk_discount_dialog.modern.${key}`, values);
}
