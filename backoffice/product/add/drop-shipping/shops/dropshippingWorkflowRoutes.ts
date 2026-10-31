export type WorkflowNode = "a" | "b" | "store" | "customer" | "wallet";
export type WorkflowStep = "setup" | "access" | "products" | "payment" | "settlement" | "delivery";
export type Point = { x: number; y: number };
export type NodeBox = { left: number; right: number; top: number; bottom: number };
export type WorkflowLayout = {
  width: number;
  height: number;
  compact: boolean;
  rtl: boolean;
  nodes: Record<WorkflowNode, NodeBox>;
};

/** Round each orthogonal turn without changing its ports or leaving the reserved lane. */
export function roundedWorkflowPath(points: Point[], radius = 9): string {
  if (points.length < 2) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const previous = points[i - 1], corner = points[i], next = points[i + 1];
    const before = Math.hypot(corner.x - previous.x, corner.y - previous.y);
    const after = Math.hypot(next.x - corner.x, next.y - corner.y);
    const turn = Math.min(radius, before / 2, after / 2);
    if (!turn) continue;
    const enter = { x: corner.x + (previous.x - corner.x) * turn / before, y: corner.y + (previous.y - corner.y) * turn / before };
    const leave = { x: corner.x + (next.x - corner.x) * turn / after, y: corner.y + (next.y - corner.y) * turn / after };
    path += ` L ${enter.x} ${enter.y} Q ${corner.x} ${corner.y} ${leave.x} ${leave.y}`;
  }
  const end = points[points.length - 1];
  return `${path} L ${end.x} ${end.y}`;
}

/** These lanes belong to the five-node illustration, not a general graph router. */
export function dropshippingWorkflowRoutes(layout: WorkflowLayout, step: WorkflowStep) {
  const { width, height, compact, rtl } = layout;
  // Measure the real RTL grid, then route in logical coordinates before mirroring its points.
  const nodes = Object.fromEntries(Object.entries(layout.nodes).map(([key, box]) => [key, {
    ...box,
    left: rtl ? width - box.right : box.left,
    right: rtl ? width - box.left : box.right,
  }])) as Record<WorkflowNode, NodeBox>;
  const { a, b, store, customer, wallet } = nodes;
  const cx = (box: NodeBox) => (box.left + box.right) / 2;
  const cy = (box: NodeBox) => (box.top + box.bottom) / 2;
  const point = (x: number, y: number): Point => ({ x, y });
  const routes: { from: WorkflowNode; to: WorkflowNode; points: Point[] }[] = [];
  const add = (from: WorkflowNode, to: WorkflowNode, points: Point[]) => routes.push({ from, to, points });

  if (compact) {
    const upper = (Math.max(a.bottom, b.bottom) + store.top) / 2;
    const lower = (store.bottom + Math.min(customer.top, wallet.top)) / 2;
    const start = Math.min(a.left, b.left, customer.left, store.left) / 2;
    const end = (width + Math.max(a.right, b.right, wallet.right, store.right)) / 2;
    if (["setup", "access", "products"].includes(step)) {
      for (const [key, box, offset] of [["a", a, -16], ["b", b, 16]] as const) {
        const points = [point(cx(box), box.bottom), point(cx(box), upper), point(cx(store) + offset, upper), point(cx(store) + offset, store.top)];
        if (step === "access") add("store", key, points.reverse());
        else add(key, "store", points);
      }
    } else if (step === "payment") {
      add("customer", "store", [point(cx(customer), customer.top), point(cx(customer), lower), point(cx(store) - 16, lower), point(cx(store) - 16, store.bottom)]);
    } else if (step === "settlement") {
      add("store", "wallet", [point(cx(store) + 16, store.bottom), point(cx(store) + 16, lower), point(cx(wallet), lower), point(cx(wallet), wallet.top)]);
      for (const [key, box] of [["a", a], ["b", b]] as const)
        add("wallet", key, [point(wallet.right, cy(wallet)), point(end, cy(wallet)), point(end, upper), point(cx(box), upper), point(cx(box), box.bottom)]);
    } else if (step === "delivery") {
      add("a", "customer", [point(a.left, cy(a)), point(start, cy(a)), point(start, cy(customer)), point(customer.left, cy(customer))]);
      add("b", "customer", [point(cx(b), b.bottom), point(cx(b), upper), point(start, upper), point(start, cy(customer)), point(customer.left, cy(customer))]);
    }
  } else {
    const start = (Math.max(a.right, b.right) + store.left) / 2;
    const end = (store.right + Math.min(customer.left, wallet.left)) / 2;
    const top = Math.min(a.top, b.top, store.top, customer.top) / 2;
    const bottom = (height + Math.max(a.bottom, b.bottom, store.bottom, wallet.bottom)) / 2;
    if (["setup", "access", "products"].includes(step)) {
      for (const [key, box, offset] of [["a", a, -14], ["b", b, 14]] as const) {
        const points = [point(box.right, cy(box)), point(start, cy(box)), point(start, cy(store) + offset), point(store.left, cy(store) + offset)];
        if (step === "access") add("store", key, points.reverse());
        else add(key, "store", points);
      }
    } else if (step === "payment") {
      add("customer", "store", [point(customer.left, cy(customer)), point(end, cy(customer)), point(end, cy(store)), point(store.right, cy(store))]);
    } else if (step === "settlement") {
      add("store", "wallet", [point(store.right, cy(store)), point(end, cy(store)), point(end, cy(wallet)), point(wallet.left, cy(wallet))]);
      for (const [key, box] of [["a", a], ["b", b]] as const)
        add("wallet", key, [point(cx(wallet), wallet.bottom), point(cx(wallet), bottom), point(start, bottom), point(start, cy(box)), point(box.right, cy(box))]);
    } else if (step === "delivery") {
      for (const [key, box] of [["a", a], ["b", b]] as const)
        add(key, "customer", [point(box.right, cy(box)), point(start, cy(box)), point(start, top), point(end, top), point(end, cy(customer)), point(customer.left, cy(customer))]);
    }
  }

  return routes.map((route) => {
    const points = route.points.map(({ x, y }) => point(rtl ? width - x : x, y));
    return { ...route, points, d: roundedWorkflowPath(points) };
  });
}
