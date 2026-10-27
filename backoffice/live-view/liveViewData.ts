export type LiveMetric =
  | "add_to_cart"
  | "remove_from_cart"
  | "product_views"
  | "purchase_actions"
  | "orders_placed";
export type LiveCounts = Record<LiveMetric, number>;
export interface LiveLocation {
  id: string;
  lat: number;
  lon: number;
  country_code: string | null;
  active_sessions: number;
  add_to_cart: number;
  orders_placed: number;
}
export interface LiveWindow {
  start: string;
  end: string;
  totals: LiveCounts;
  trend: ({ at: string } & LiveCounts)[];
  events: {
    at: string;
    type: LiveMetric;
    country_code: string | null;
    count: number;
  }[];
  locations: LiveLocation[];
}
export interface LiveSnapshot {
  shop_id: number;
  simulated?: boolean;
  as_of: string;
  sequence: number;
  presence_window_seconds: number;
  active_sessions: number;
  signed_in_customers: number;
  mapped_sessions: number;
  unlocated_sessions: number;
  other_locations_sessions?: number;
  countries: { country_code: string; active_sessions: number }[];
  locations: LiveLocation[];
  windows: Record<string, LiveWindow>;
  truncated: boolean;
  transport: {
    enabled: boolean;
    channel: string;
    event: string;
    auth_endpoint: string;
    lease_seconds: number;
    refresh_seconds: number;
  };
}

// A response from a previous shop/request must never restore another tenant's map.
export function acceptsSnapshot(
  snapshot: LiveSnapshot,
  shopId: number,
  previous: LiveSnapshot | null,
) {
  return (
    snapshot?.shop_id === shopId &&
    Number.isFinite(snapshot.sequence) &&
    Number.isFinite(Date.parse(snapshot.as_of)) &&
    !!snapshot.windows?.["5"] &&
    !!snapshot.windows?.["15"] &&
    (!previous || snapshot.sequence >= previous.sequence)
  );
}

export function liveLocations(
  snapshot: LiveSnapshot | null,
  minutes: number,
): LiveLocation[] {
  if (!snapshot) return [];
  const locations = new Map<string, LiveLocation>();
  for (const item of snapshot.locations || [])
    locations.set(item.id, { ...item, add_to_cart: 0, orders_placed: 0 });
  for (const item of snapshot.windows[String(minutes)]?.locations || []) {
    const active = locations.get(item.id);
    locations.set(item.id, {
      ...item,
      active_sessions: active?.active_sessions || 0,
    });
  }
  return [...locations.values()].filter(
    (item) =>
      Number.isFinite(item.lat) &&
      Number.isFinite(item.lon) &&
      Math.abs(item.lat) <= 90 &&
      Math.abs(item.lon) <= 180 &&
      (item.active_sessions > 0 ||
        item.add_to_cart > 0 ||
        item.orders_placed > 0),
  );
}

export interface LiveCluster {
  id: string;
  ids: string[];
  x: number;
  y: number;
  active_sessions: number;
  add_to_cart: number;
  orders_placed: number;
  countries: string[];
}

// At most 128 server geo cells; nearby screen points share one accessible button.
export function clusterLocations(
  locations: LiveLocation[],
  project: (point: number[]) => number[] | null,
  transform: { x: number; y: number; k: number },
  width: number,
  height: number,
): LiveCluster[] {
  const groups: LiveCluster[] = [];
  for (const item of locations) {
    const point = project([item.lon, item.lat]);
    if (!point) continue;
    const x = point[0] * transform.k + transform.x,
      y = point[1] * transform.k + transform.y;
    if (x < 0 || y < 0 || x > width || y > height) continue;
    const group = groups.find(
      (group) => Math.hypot(group.x - x, group.y - y) < 44,
    );
    if (group) {
      const n = group.ids.length;
      group.x = (group.x * n + x) / (n + 1);
      group.y = (group.y * n + y) / (n + 1);
      group.ids.push(item.id);
      group.id = [...group.ids].sort().join("|");
      group.active_sessions += item.active_sessions || 0;
      group.add_to_cart += item.add_to_cart || 0;
      group.orders_placed += item.orders_placed || 0;
      if (item.country_code && !group.countries.includes(item.country_code))
        group.countries.push(item.country_code);
    } else
      groups.push({
        id: item.id,
        ids: [item.id],
        x,
        y,
        active_sessions: item.active_sessions || 0,
        add_to_cart: item.add_to_cart || 0,
        orders_placed: item.orders_placed || 0,
        countries: item.country_code ? [item.country_code] : [],
      });
  }
  return groups;
}
