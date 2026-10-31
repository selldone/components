import { roundPoint } from "./number";

const createCurves = (x1, y1, x2, y2) =>
  ` C${roundPoint((x2 + x1) / 2)},${y1} ` +
  `${roundPoint((x2 + x1) / 2)},${y2} ${x2},${y2}`;

const createVerticalCurves = (x1, y1, x2, y2) =>
  ` C${x1},${roundPoint((y2 + y1) / 2)} ` +
  `${x2},${roundPoint((y2 + y1) / 2)} ${x2},${y2}`;

/*
    A funnel segment is draw in a clockwise direction.
    Path 1-2 is drawn,
    then connected with a straight vertical line 2-3,
    then a line 3-4 is draw (using YNext points going in backwards direction)
    then path is closed (connected with the starting point 1).

    1---------->2
    ^           |
    |           v
    4<----------3

    On the graph on line 20 it works like this:
    A#0, A#1, A#2, A#3, B#3, B#2, B#1, B#0, close the path.

    Points for path "B" are passed as the YNext param.
 */

const createPath = (index, X, Y, YNext) => {
  let str = `M${X[0]},${Y[0]}`;

  for (let i = 0; i < X.length - 1; i++) {
    str += createCurves(X[i], Y[i], X[i + 1], Y[i + 1]);
  }

  str += ` L${[...X].pop()},${[...YNext].pop()}`;

  for (let i = X.length - 1; i > 0; i--) {
    str += createCurves(X[i], YNext[i], X[i - 1], YNext[i - 1]);
  }

  str += " Z";

  return str;
};

/*
    In a vertical path we go counter-clockwise

    1<----------4
    |           ^
    v           |
    2---------->3
 */

const createVerticalPath = (index, X, XNext, Y) => {
  let str = `M${X[0]},${Y[0]}`;

  for (let i = 0; i < X.length - 1; i++) {
    str += createVerticalCurves(X[i], Y[i], X[i + 1], Y[i + 1]);
  }

  str += ` L${[...XNext].pop()},${[...Y].pop()}`;

  for (let i = X.length - 1; i > 0; i--) {
    str += createVerticalCurves(XNext[i], Y[i], XNext[i - 1], Y[i - 1]);
  }

  str += " Z";

  return str;
};

// Fit identities inside the same cubic boundaries used by createPath, without changing the data.
const getFunnelIdentityPositions = (
  X,
  boundaries,
  { width, height, rtl = false, size = 20 },
) => {
  const padding = 4;
  const half = size / 2 + padding;
  if (
    !Number.isFinite(width) || !Number.isFinite(height) ||
    width < half * 2 || height < half * 2 ||
    !Number.isFinite(size) || size <= 0 || X.length < 2 ||
    X.some((x, i) => !Number.isFinite(x) || (i > 0 && x <= X[i - 1]))
  ) return [];

  const boundaryAt = (Y, x) => {
    const end = X.findIndex((point) => point >= x);
    if (end <= 0) return end === 0 ? Y[0] : Y[Y.length - 1];
    const start = end - 1;
    const middle = roundPoint((X[start] + X[end]) / 2);
    let low = 0;
    let high = 1;
    // Invert the native monotone cubic X(t), then evaluate its Y(t).
    for (let i = 0; i < 16; i++) {
      const t = (low + high) / 2;
      const inverse = 1 - t;
      const point = inverse ** 3 * X[start] + 3 * inverse * t * middle + t ** 3 * X[end];
      if (point < x) low = t;
      else high = t;
    }
    const t = (low + high) / 2;
    return Y[start] + (Y[end] - Y[start]) * (3 * t ** 2 - 2 * t ** 3);
  };

  const samples = [width / 2, width - half];
  for (let x = half; x <= width - half; x += 4) samples.push(x);
  const bands = [];
  for (let index = 0; index < boundaries.length - 1; index++) {
    const upper = boundaries[index];
    const lower = boundaries[index + 1];
    if ([upper, lower].some((Y) => Y.length !== X.length || Y.some((y) => !Number.isFinite(y)))) continue;
    const candidates = [];
    for (const x of samples) {
      // Cubic boundaries are monotone between knots, so these bound the whole icon footprint.
      const left = x - half;
      const right = x + half;
      const points = [left, right, ...X.filter((point) => point > left && point < right)];
      const top = Math.max(0, ...points.map((point) => boundaryAt(upper, point)));
      const bottom = Math.min(height, ...points.map((point) => boundaryAt(lower, point)));
      if (bottom - top >= half * 2) candidates.push({ index, x, y: (top + bottom) / 2, size, space: bottom - top });
    }
    candidates.sort((a, b) => b.space - a.space || Math.abs(a.x - width / 2) - Math.abs(b.x - width / 2));
    if (candidates.length) bands.push(candidates);
  }

  // Broad bands choose first; narrow views never pile identities on top of one another.
  bands.sort((a, b) => b[0].space - a[0].space);
  const positions = [];
  for (const candidates of bands) {
    const candidate = candidates.find((point) => positions.every((other) =>
      Math.abs(point.x - other.x) >= size + padding || Math.abs(point.y - other.y) >= size + padding,
    ));
    if (candidate) positions.push({ index: candidate.index, x: candidate.x, y: candidate.y, size });
  }
  return positions.sort((a, b) => a.index - b.index).map((point) => ({ ...point, x: rtl ? width - point.x : point.x }));
};

export { createCurves, createVerticalCurves, createPath, createVerticalPath, getFunnelIdentityPositions };
