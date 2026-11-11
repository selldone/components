/** Article audit values stay distinct from unavailable fields and missing calendar days. */
export function searchNumber(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function dayTime(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const time = Date.parse(day + "T00:00:00Z");
  return Number.isFinite(time) &&
    new Date(time).toISOString().slice(0, 10) === day
    ? time
    : null;
}

export function searchDays(input: unknown): Array<Record<string, any>> {
  if (!Array.isArray(input)) return [];
  return input
    .flatMap((row) => {
      const t = dayTime(row?.keys);
      if (t === null) return [];
      const clicks = searchNumber(row.clicks),
        impressions = searchNumber(row.impressions),
        ctr = searchNumber(row.ctr),
        position = searchNumber(row.position);
      const ratio =
        clicks !== null && impressions !== null
          ? impressions > 0
            ? clicks / impressions
            : clicks === 0
              ? 0
              : null
          : ctr;
      return [
        {
          ...row,
          t,
          clicks,
          impressions,
          ctr: ratio !== null && ratio <= 1 ? ratio : null,
          position: position !== null && position >= 1 ? position : null,
        },
      ];
    })
    .sort((a, b) => a.t - b.t);
}

/** Only returned daily records contribute. A missing metric makes its aggregate unavailable. */
export function searchTotals(days: Array<Record<string, any>>) {
  const sum = (key: string) =>
    days.length && days.every((row) => row[key] !== null)
      ? days.reduce((total, row) => total + row[key], 0)
      : null;
  const clicks = sum("clicks"),
    impressions = sum("impressions");
  const weighted =
    days.length &&
    days.every(
      (row) =>
        row.impressions !== null &&
        (row.impressions === 0 || row.position !== null),
    );
  return {
    clicks,
    impressions,
    ctr:
      clicks !== null && impressions !== null
        ? impressions > 0
          ? clicks <= impressions
            ? clicks / impressions
            : null
          : clicks === 0
            ? 0
            : null
        : null,
    position:
      weighted && impressions
        ? days.reduce(
            (total, row) =>
              total + (row.impressions ? row.position * row.impressions : 0),
            0,
          ) / impressions
        : null,
  };
}

/** Null samples break a line across gaps; they never manufacture an observed zero. */
export function searchPoints(
  days: Array<Record<string, any>>,
  key: string,
  start?: unknown,
  end?: unknown,
) {
  if (!days.length) return [];
  const points: Array<{ x: number; y: number | null }> = [];
  const first = dayTime(start),
    last = dayTime(end),
    day = 86_400_000;
  if (first !== null && first < days[0].t) points.push({ x: first, y: null });
  days.forEach((row, index) => {
    if (index && row.t - days[index - 1].t > day)
      points.push({ x: days[index - 1].t + day, y: null });
    points.push({ x: row.t, y: row[key] });
  });
  if (last !== null && last > days[days.length - 1].t)
    points.push({ x: last, y: null });
  return points;
}

export const SEARCH_COLORS = [
  "#7655c9",
  "#5794c8",
  "#58a497",
  "#c8a359",
  "#b56b85",
  "#7b8d61",
];

/** The denominator is exactly the returned rows, never an implied page or property total. */
export function searchShares(input: unknown) {
  const rows = Array.isArray(input)
    ? input
        .filter((row) => row && typeof row === "object")
        .map((row, index) => ({
          ...row,
          value: searchNumber(row.clicks),
          color: SEARCH_COLORS[index % SEARCH_COLORS.length],
        }))
    : [];
  const total =
    rows.length && rows.every((row) => row.value !== null)
      ? rows.reduce((sum, row) => sum + row.value, 0)
      : null;
  return {
    total,
    rows: rows.map((row) => ({
      ...row,
      share: total ? row.value / total : null,
    })),
  };
}
