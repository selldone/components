const helpRoot = "admin_shop.orders.physical.modern";

export function getOrderAttention({
  rejected,
  queued,
  daysSinceUpdate,
}: {
  rejected?: boolean;
  queued?: boolean;
  daysSinceUpdate?: number | null;
}) {
  if (!rejected && !queued) return null;

  // Keep these boundaries aligned with the existing emoji assets in the list.
  let state = "recent";
  if (rejected) state = "rejected";
  else if (typeof daysSinceUpdate !== "number" || !Number.isFinite(daysSinceUpdate) || daysSinceUpdate < 0) state = "unknown";
  else if (daysSinceUpdate > 10) state = "urgent";
  else if (daysSinceUpdate > 7) state = "angry";
  else if (daysSinceUpdate > 5) state = "mad";
  else if (daysSinceUpdate > 3) state = "annoyed";
  else if (daysSinceUpdate > 2) state = "sad";
  else if (daysSinceUpdate > 1) state = "watching";

  return {
    titleKey: `${helpRoot}.attention.${state}.title`,
    bodyKey: `${helpRoot}.attention.${state}.body`,
  };
}

export function getPaymentDetailRows(payment: {
  card?: { bank?: unknown } | null;
  risk?: unknown;
} | null | undefined) {
  const rows: { key: string; labelKey: string; value: string }[] = [];
  const bank = payment?.card?.bank;
  if (typeof bank === "string" && bank.trim()) {
    rows.push({
      key: "bank",
      labelKey: `${helpRoot}.payment.issuer`,
      value: bank.trim().slice(0, 120),
    });
  }

  const risk = payment?.risk;
  if (typeof risk === "number" && Number.isFinite(risk) && risk >= 0 && risk <= 100) {
    rows.push({
      key: "risk",
      labelKey: `${helpRoot}.payment.risk`,
      value: `${risk} / 100`,
    });
  }
  return rows;
}
