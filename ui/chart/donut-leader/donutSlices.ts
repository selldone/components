/*
 * Colors of the leader-line donut and the rule that fits any list into it (the same palette
 * as the shop dashboard's app donuts).
 */

/** Categorical palette, in order; the folded rest stays neutral. */
export const PALETTE = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#6250d6",
];
export const REST_COLOR = "#a3a3a3";

export interface DonutSlice {
  key: string;
  label: string;
  value: number;
  color: string;
  share: number;
  image?: string | null;
}

/**
 * Largest first: up to six items in their own or the palette's colors, or the five largest
 * and the rest folded into one neutral slice named by `restLabel`. Empty items are left out.
 */
export function foldSlices(
  items: {
    key: string;
    label: string;
    value: number;
    color?: string;
    image?: string | null;
  }[],
  restLabel: (count: number) => string,
): DonutSlice[] {
  const sorted = items
    .filter((item) => Number.isFinite(item.value) && item.value > 0)
    .sort((a, b) => b.value - a.value);
  const total = sorted.reduce((sum, item) => sum + item.value, 0);
  const shown = sorted.length > 6 ? sorted.slice(0, 5) : sorted;
  const rest = sorted.slice(shown.length);
  const slices = shown.map((item, index) => ({
    ...item,
    color: item.color || PALETTE[index % PALETTE.length],
  }));
  if (rest.length)
    slices.push({
      key: "rest",
      label: restLabel(rest.length),
      value: rest.reduce((sum, item) => sum + item.value, 0),
      color: REST_COLOR,
    });
  return slices.map((slice) => ({ ...slice, share: slice.value / total }));
}
