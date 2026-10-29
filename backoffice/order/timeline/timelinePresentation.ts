export type TimelineCategory = "order" | "payment" | "message" | "note";

export type TimelineEntry = {
  id: string | number;
  type?: string;
  shop_id?: string | number | null;
  created_at?: string | null;
  pin?: boolean;
  data?: Record<string, unknown> | null;
};

export type TimelineRow = {
  key: string;
  items: TimelineEntry[];
  bundle: boolean;
  titleKey?: string;
};

export type TimelineSection = {
  key: string;
  pinned: boolean;
  date: string | null;
  rows: TimelineRow[];
};

const paymentTypes = new Set([
  "payment",
  "payment-cod-confirm",
  "payment-cash-confirm",
  "payment-dir-confirm",
  "vendor-payout",
  "vendor-wallet-transaction",
]);

const customerNotifications: Record<string, string> = {
  "email-buy": "checkout",
  "email-payment": "payment",
  "email-update": "update",
  "sms-payment": "payment",
  "sms-ready-to-ship": "shipping",
  "sms-ready-to-pickup": "pickup",
  "sms-order-confirmation": "confirmation",
};

export function getTimelineCategory(type: unknown): TimelineCategory {
  if (type === "note") return "note";
  if (typeof type !== "string") return "order";
  if (paymentTypes.has(type)) return "payment";
  if (
    type.startsWith("email-") ||
    type.startsWith("sms-") ||
    type === "vendor-sms"
  ) return "message";
  return "order";
}

function eventDate(item: TimelineEntry) {
  if (!item.created_at) return null;
  const date = new Date(item.created_at);
  return Number.isFinite(date.getTime()) ? date : null;
}

function dayKey(date: Date | null) {
  return date
    ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    : "unknown";
}

function notificationFamily(item: TimelineEntry) {
  // Vendor/Connect records may refer to a different recipient or fulfillment.
  if (
    item.data?.vendor_id != null ||
    item.data?.vendor_order_id != null ||
    item.data?.connect_id != null
  ) return null;
  const type = item.type;
  return typeof type === "string" && Object.hasOwn(customerNotifications, type)
    ? customerNotifications[type]
    : null;
}

/** Presentation only: preserve the received sequence and original event objects. */
export function buildTimelineSections(
  items: TimelineEntry[],
  filter: "all" | TimelineCategory = "all",
): TimelineSection[] {
  const pinned: TimelineSection = {
    key: "pinned",
    pinned: true,
    date: null,
    rows: [],
  };
  const days: TimelineSection[] = [];
  let currentDay = "";
  let section: TimelineSection | null = null;
  let run: {
    row: TimelineRow;
    timestamp: number;
    family: string;
    hasUpdate: boolean;
    shopId: TimelineEntry["shop_id"];
    phone: unknown;
  } | null = null;

  items.forEach((item, index) => {
    const row: TimelineRow = {
      key: `event-${item.id ?? index}`,
      items: [item],
      bundle: false,
    };
    if (item.pin) {
      pinned.rows.push(row);
      run = null;
      return;
    }

    const date = eventDate(item);
    const day = dayKey(date);
    if (!section || currentDay !== day) {
      section = {
        key: `day-${day}-${index}`,
        pinned: false,
        date: date ? item.created_at! : null,
        rows: [],
      };
      days.push(section);
      currentDay = day;
      run = null;
    }

    const family = notificationFamily(item);
    const phone = item.data?.phone;
    const compatible =
      run && date && family &&
      Math.abs(date.getTime() - run.timestamp) <= 60_000 &&
      run.shopId === item.shop_id &&
      (phone == null || run.phone == null || phone === run.phone) &&
      (family === "update" || run.family === "update" || family === run.family);

    if (compatible && run) {
      run.row.items.push(item);
      run.row.bundle = true;
      run.hasUpdate ||= family === "update";
      if (run.family === "update") run.family = family;
      if (run.phone == null) run.phone = phone;
      run.row.titleKey = `order_timeline.modern.bundle_${run.hasUpdate ? "notifications" : run.family}`;
      return;
    }

    section.rows.push(row);
    run = family && date
      ? {
        row,
        timestamp: date.getTime(),
        family,
        hasUpdate: family === "update",
        shopId: item.shop_id,
        phone,
      }
      : null;
  });

  // Filter after grouping, so hiding an order event never joins unrelated messages.
  return [pinned, ...days]
    .map((day) => ({
      ...day,
      rows: day.rows.filter((row) =>
        filter === "all" || getTimelineCategory(row.items[0].type) === filter,
      ),
    }))
    .filter((day) => day.rows.length > 0);
}
