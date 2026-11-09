export type ApiDocFlowTone = "success" | "error" | "warning" | "neutral";

export interface ApiDocFlowOutcome {
  label: string;
  tone: ApiDocFlowTone;
}

export interface ApiDocFlowNode {
  id: string;
  label: string;
  description: string;
  /** Material icon ligature shown in the tile; empty when the source gives none. */
  icon: string;
  /** One-line detail under the label, clipped by the renderer. */
  caption: string;
  /** What the step returns when it fails or succeeds, shown as a dot-marked chip. */
  outcome: ApiDocFlowOutcome | null;
}

export interface ApiDocFlowEdge {
  from: string;
  to: string;
  label: string;
}

export interface ApiDocFlowBlock {
  type: "flow";
  title: string;
  description: string;
  nodes: ApiDocFlowNode[];
  edges: ApiDocFlowEdge[];
  animated: boolean;
}

/** Grid placement of one tile. Rows and columns are zero-based; span is the number of grid rows the tile covers. */
export interface ApiDocFlowCell {
  id: string;
  column: number;
  row: number;
  span: number;
}

export interface ApiDocFlowLayout {
  /** rail: steps in reading order wrapped into rows; layered: branches side by side by their depth from the sources. */
  kind: "rail" | "layered";
  columns: number;
  rows: number;
  cells: ApiDocFlowCell[];
  /** Narrow column only: the bypass lane of every edge (-1 between neighbours), each pill's place in the gap above its target, the lane count and the longest stack. */
  edgeLanes?: number[];
  edgeStacks?: number[];
  lanes?: number;
  stacked?: number;
}

export interface ApiDocFlowBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ApiDocFlowConnector {
  d: string;
  mid: { x: number; y: number };
  /** Straight horizontal link inside one row; its label sits above the line. */
  horizontal: boolean;
  length: number;
  /** end: a bypass link whose pill is aligned to its lane in the gap above the target. */
  align?: "end";
}

const TONES: ApiDocFlowTone[] = ["success", "error", "warning", "neutral"];

const boundedText = (value: unknown, max: number): string =>
  typeof value === "string" && value.length <= max ? value.trim() : "";

const iconName = (value: unknown): string =>
  typeof value === "string" && /^[a-z][a-z0-9_]{0,39}$/.test(value)
    ? value
    : "";

function outcome(value: unknown): ApiDocFlowOutcome | null {
  if (!value || typeof value !== "object") return null;
  const label = boundedText((value as { label?: unknown }).label, 80);
  const tone = (value as { tone?: unknown }).tone;
  if (!label) return null;
  return {
    label,
    tone: TONES.includes(tone as ApiDocFlowTone)
      ? (tone as ApiDocFlowTone)
      : "neutral",
  };
}

export function normalizeDocFlow(value: unknown): ApiDocFlowBlock | null {
  if (!value || typeof value !== "object") return null;
  const block = value as Record<string, any>;
  const title = boundedText(block.title, 160);
  const description = boundedText(block.description, 2000);
  if (!title) return null;
  if (
    block.type !== "flow" ||
    !Array.isArray(block.nodes) ||
    block.nodes.length < 2 ||
    block.nodes.length > 6 ||
    !Array.isArray(block.edges) ||
    block.edges.length > 12
  )
    return null;
  const nodes: ApiDocFlowNode[] = block.nodes.map((node) => ({
    id: boundedText(node?.id, 60),
    label: boundedText(node?.label, 160),
    description: boundedText(node?.description, 500),
    icon: iconName(node?.icon),
    caption: boundedText(node?.caption, 90),
    outcome: outcome(node?.outcome),
  }));
  const ids = new Set(nodes.map((node) => node.id));
  if (
    ids.size !== nodes.length ||
    nodes.some((node) => !node.id || !node.label)
  )
    return null;
  const edges: ApiDocFlowEdge[] = block.edges.flatMap((edge) =>
    edge && ids.has(edge.from) && ids.has(edge.to) && edge.from !== edge.to
      ? [
          {
            from: edge.from,
            to: edge.to,
            label: boundedText(edge.label, 240),
          },
        ]
      : [],
  );
  return {
    type: "flow",
    title,
    description,
    nodes,
    edges,
    animated: block.animated === true,
  };
}

/** Longest-path depth of every node from the sources (edges form a DAG; cycles stop at the node count). */
function depths(block: ApiDocFlowBlock): Map<string, number> {
  const depth = new Map(block.nodes.map((node) => [node.id, 0]));
  for (let pass = 0; pass < block.nodes.length; pass++) {
    let changed = false;
    for (const edge of block.edges) {
      const next = (depth.get(edge.from) ?? 0) + 1;
      if (next > (depth.get(edge.to) ?? 0) && next < block.nodes.length) {
        depth.set(edge.to, next);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return depth;
}

function rail(block: ApiDocFlowBlock, columns: number): ApiDocFlowLayout {
  return {
    kind: "rail",
    columns,
    rows: Math.ceil(block.nodes.length / columns),
    cells: block.nodes.map((node, index) => ({
      id: node.id,
      column: index % columns,
      row: Math.floor(index / columns),
      span: 1,
    })),
  };
}

/** At most this many bypass lanes beside a narrow column; denser flows share lanes. */
const LANES = 3;

/**
 * One column for narrow containers. Tiles follow their depth so every link points down; a link that skips a
 * tile leaves the column and runs down a bypass lane beside it (overlapping spans get their own lane, touching
 * spans share one), with its label stacked in the gap above the target.
 */
function column(block: ApiDocFlowBlock): ApiDocFlowLayout {
  const index = new Map(
    block.nodes.map((node, position) => [node.id, position]),
  );
  const depth = depths(block);
  const order = [...block.nodes].sort(
    (a, b) =>
      (depth.get(a.id) ?? 0) - (depth.get(b.id) ?? 0) ||
      (index.get(a.id) ?? 0) - (index.get(b.id) ?? 0),
  );
  const row = new Map(order.map((node, position) => [node.id, position]));
  const spans = block.edges.map((edge, position) => {
    const a = row.get(edge.from) ?? 0;
    const b = row.get(edge.to) ?? 0;
    return { position, start: Math.min(a, b), end: Math.max(a, b), target: b };
  });
  const ends: number[] = [];
  const edgeLanes = block.edges.map(() => -1);
  const edgeStacks = block.edges.map(() => 0);
  const entering = new Map<number, number>();
  for (const span of spans
    .filter((span) => span.end - span.start !== 1)
    .sort((a, b) => a.start - b.start || a.end - b.end)) {
    let lane = ends.findIndex((end) => end <= span.start);
    if (lane < 0) lane = ends.push(span.end) - 1;
    else ends[lane] = span.end;
    edgeLanes[span.position] = lane % LANES;
    edgeStacks[span.position] = entering.get(span.target) ?? 0;
    entering.set(span.target, edgeStacks[span.position] + 1);
  }
  return {
    kind: "rail",
    columns: 1,
    rows: order.length,
    cells: order.map((node, position) => ({
      id: node.id,
      column: 0,
      row: position,
      span: 1,
    })),
    edgeLanes,
    edgeStacks,
    lanes: Math.min(LANES, ends.length),
    stacked: Math.max(0, ...entering.values()),
  };
}

/** Bypass lanes beside a narrow column: distance between lanes, inset from the tiles and the corner radius. */
const LANE_WIDTH = 22;
const LANE_INSET = 12;
const LANE_CORNER = 16;

/** Horizontal room a narrow stage reserves at its inline end for the bypass lanes of a layout. */
export function laneGutter(layout: ApiDocFlowLayout): number {
  return layout.lanes ? LANE_INSET + layout.lanes * LANE_WIDTH : 0;
}

/**
 * Where each tile goes. A linear sequence becomes a rail of up to three tiles per row (two rows of two for
 * four steps) so the stage stays short; branches become columns ordered by depth with their tiles stacked
 * and centred. Narrow containers stack everything in one column with bypass lanes for links that skip a tile.
 * Runtime callers can prefer another rail width without changing the stored article definition.
 */
export function layoutFlow(
  block: ApiDocFlowBlock,
  narrow = false,
  preferredRailColumns = 0,
): ApiDocFlowLayout {
  const count = block.nodes.length;
  if (narrow) return column(block);
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();
  for (const edge of block.edges) {
    incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1);
    outgoing.set(edge.from, (outgoing.get(edge.from) ?? 0) + 1);
  }
  const branching = block.nodes.some(
    (node) =>
      (incoming.get(node.id) ?? 0) > 1 || (outgoing.get(node.id) ?? 0) > 1,
  );
  const railColumns = Math.min(
    count,
    preferredRailColumns || (count <= 3 ? count : count === 4 ? 2 : 3),
  );
  if (!branching) return rail(block, railColumns);
  const depth = depths(block);
  const columns = Math.max(...depth.values()) + 1;
  if (columns > 4) return rail(block, railColumns);
  const byColumn: string[][] = Array.from({ length: columns }, () => []);
  for (const node of block.nodes)
    byColumn[depth.get(node.id) ?? 0].push(node.id);
  const rows = Math.max(...byColumn.map((members) => members.length));
  const cells: ApiDocFlowCell[] = [];
  byColumn.forEach((members, column) => {
    const span = Math.max(1, Math.floor(rows / members.length));
    const offset = Math.floor((rows - span * members.length) / 2);
    members.forEach((id, index) =>
      cells.push({ id, column, row: offset + index * span, span }),
    );
  });
  return { kind: "layered", columns, rows, cells };
}

/**
 * Stage width below which a block stacks in one column: 480px, or 150px per column of its wide layout plus
 * 40px gaps when that needs more, so tiles keep readable labels. A column that is already narrow needs 60px
 * more to switch back, which keeps a scrollbar that appears with the taller column from flipping the layout.
 */
const NARROW_STAGE = 480;
const MIN_TILE = 150;
const MIN_GAP = 40;
const NARROW_RELEASE = 60;
/** Compact runtime rails (product workspaces): icon-over-label tiles need less room per column. */
export const COMPACT_TILE = 84;
export const COMPACT_GAP = 20;

export function narrowThreshold(
  block: ApiDocFlowBlock,
  narrow = false,
  preferredRailColumns = 0,
  compact = false,
): number {
  const columns = layoutFlow(block, false, preferredRailColumns).columns;
  const tile = compact ? COMPACT_TILE : MIN_TILE;
  const gap = compact ? COMPACT_GAP : MIN_GAP;
  return (
    Math.max(NARROW_STAGE, columns * tile + (columns - 1) * gap) +
    (narrow ? NARROW_RELEASE : 0)
  );
}

/**
 * Columns of a compact rail at a stage width: every tile in one row when it fits, otherwise the fewest rows
 * with the tiles spread evenly over them, so no row ends with a lone tile. `max` caps the columns (0 = no cap).
 */
export function compactRailColumns(
  count: number,
  width: number,
  max = 0,
): number {
  if (count < 1) return 1;
  const fit = Math.max(
    1,
    Math.min(
      max || count,
      count,
      Math.floor((width + COMPACT_GAP) / (COMPACT_TILE + COMPACT_GAP)),
    ),
  );
  return Math.ceil(count / Math.ceil(count / fit));
}

/** Animation stage of every edge: its source's place in a rail (reading order, or the column order when narrow), its source's depth in a layered flow. */
export function edgeStages(
  block: ApiDocFlowBlock,
  layout: ApiDocFlowLayout,
): number[] {
  const order = new Map(
    layout.cells.map((cell) => [
      cell.id,
      cell.row * layout.columns + cell.column,
    ]),
  );
  const depth = layout.kind === "layered" ? depths(block) : order;
  return block.edges.map((edge) => depth.get(edge.from) ?? 0);
}

/**
 * Seconds between the start of one stage and the next so the whole story, including the longest travel of
 * 0.9s after a 0.3s lead-in, finishes within the four-second illustration budget.
 */
export function motionStep(stages: number): number {
  return Math.min(0.7, 2.1 / Math.max(1, stages - 1));
}

function cubic(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
): ApiDocFlowConnector {
  const at = (t: number): [number, number] => {
    const u = 1 - t;
    return [
      u * u * u * p0[0] +
        3 * u * u * t * p1[0] +
        3 * u * t * t * p2[0] +
        t * t * t * p3[0],
      u * u * u * p0[1] +
        3 * u * u * t * p1[1] +
        3 * u * t * t * p2[1] +
        t * t * t * p3[1],
    ];
  };
  let length = 0;
  let previous = p0;
  for (let step = 1; step <= 16; step++) {
    const point = at(step / 16);
    length += Math.hypot(point[0] - previous[0], point[1] - previous[1]);
    previous = point;
  }
  const r = (value: number) => Math.round(value * 10) / 10;
  const mid = at(0.5);
  return {
    d: `M${r(p0[0])},${r(p0[1])} C${r(p1[0])},${r(p1[1])} ${r(p2[0])},${r(p2[1])} ${r(p3[0])},${r(p3[1])}`,
    mid: { x: r(mid[0]), y: r(mid[1]) },
    horizontal: false,
    length: Math.max(1, Math.ceil(length)),
  };
}

const round = (value: number) => Math.round(value * 10) / 10;

function quadraticLength(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
): number {
  let length = 0;
  let previous = p0;
  for (let step = 1; step <= 8; step++) {
    const t = step / 8;
    const u = 1 - t;
    const point: [number, number] = [
      u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
    ];
    length += Math.hypot(point[0] - previous[0], point[1] - previous[1]);
    previous = point;
  }
  return length;
}

/**
 * A link that skips tiles in a narrow column: it leaves the outer edge of the source, turns into its lane, runs
 * past the skipped tiles and turns back into the outer edge of the target. Lanes sit at the inline end so the
 * writing direction mirrors them; the pill is aligned to the lane in the gap above the target.
 */
function bypass(
  from: ApiDocFlowBox,
  to: ApiDocFlowBox,
  rtl: boolean,
  lane: number,
  stack: number,
): ApiDocFlowConnector {
  const side = rtl ? -1 : 1;
  const start: [number, number] = [
    rtl ? from.x : from.x + from.w,
    from.y + from.h / 2 + lane * 6,
  ];
  const end: [number, number] = [
    rtl ? to.x : to.x + to.w,
    to.y + to.h / 2 - lane * 6,
  ];
  const laneX = start[0] + side * (LANE_INSET + lane * LANE_WIDTH);
  const down = end[1] >= start[1] ? 1 : -1;
  const k = Math.min(LANE_CORNER, Math.abs(end[1] - start[1]) / 2);
  const outer: [number, number] = [laneX, start[1] + down * k];
  const inner: [number, number] = [laneX, end[1] - down * k];
  const length =
    quadraticLength(start, [laneX, start[1]], outer) +
    Math.abs(inner[1] - outer[1]) +
    quadraticLength(inner, [laneX, end[1]], end);
  return {
    d: `M${round(start[0])},${round(start[1])} Q${round(laneX)},${round(start[1])} ${round(outer[0])},${round(outer[1])} L${round(inner[0])},${round(inner[1])} Q${round(laneX)},${round(end[1])} ${round(end[0])},${round(end[1])}`,
    mid: { x: round(laneX - side * 6), y: round(to.y - 12 - stack * 18) },
    horizontal: false,
    length: Math.max(1, Math.ceil(length)),
    align: "end",
  };
}

/**
 * Curve between two measured tiles. Tiles in one row join at their facing edges; a tile in a later row is
 * reached from the bottom of the source with an S-curve into its top; layered branches leave the inline end
 * of the source and enter the inline start of the target. Ports follow the writing direction.
 */
export function connectorPath(
  from: ApiDocFlowBox,
  to: ApiDocFlowBox,
  options: {
    rtl?: boolean;
    layered?: boolean;
    /** Narrow column: the bypass lane (0-based) of a link that skips a tile and its pill's place in the gap above the target. */
    lane?: number;
    stack?: number;
  } = {},
): ApiDocFlowConnector {
  const rtl = options.rtl === true;
  if (options.lane !== undefined && options.lane >= 0)
    return bypass(from, to, rtl, options.lane, options.stack ?? 0);
  const start: [number, number] = [
    rtl ? from.x : from.x + from.w,
    from.y + from.h / 2,
  ];
  const end: [number, number] = [rtl ? to.x + to.w : to.x, to.y + to.h / 2];
  const sameRow = Math.abs(from.y - to.y) < 2;
  if (sameRow && Math.abs(start[0] - end[0]) >= 8) {
    const dx = (end[0] - start[0]) * 0.5;
    return {
      ...cubic(start, [start[0] + dx, start[1]], [end[0] - dx, end[1]], end),
      horizontal: true,
    };
  }
  if (options.layered && from.x !== to.x) {
    const xm = (start[0] + end[0]) / 2;
    return cubic(start, [xm, start[1]], [xm, end[1]], end);
  }
  const down = to.y >= from.y;
  const top: [number, number] = [
    from.x + from.w / 2,
    down ? from.y + from.h : from.y,
  ];
  const bottom: [number, number] = [to.x + to.w / 2, down ? to.y : to.y + to.h];
  const k = Math.max(24, Math.abs(bottom[1] - top[1]) * 0.6) * (down ? 1 : -1);
  return cubic(top, [top[0], top[1] + k], [bottom[0], bottom[1] - k], bottom);
}
