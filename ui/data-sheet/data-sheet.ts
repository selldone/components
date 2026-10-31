/** JSON paths stay as segments so literal dots, slashes and Unicode keys remain distinct. */
export function sheetPathKey(path: readonly string[]): string {
  return `extra:${JSON.stringify(path)}`;
}

export function sheetPathLabel(path: readonly string[]): string {
  return path.reduce((label, key) => {
    if (/^[A-Za-z_$][\w$]*$/.test(key)) return `${label}${label ? "." : ""}${key}`;
    return `${label}[${JSON.stringify(key)}]`;
  }, "");
}

export function readSheetPath(
  source: unknown,
  path: readonly string[],
): { exists: boolean; value: unknown } {
  let value = source;
  for (const key of path) {
    if (value === null || typeof value !== "object") return { exists: false, value: undefined };
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) return { exists: false, value: undefined };
    value = descriptor.value;
  }
  return { exists: true, value };
}

export function sheetValueType(value: unknown, exists = true): string {
  if (!exists) return "missing";
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

export function formatSheetValue(
  value: unknown,
  { exists = true, pretty = false, maxLength = 200 } = {},
): string {
  let text: string;
  if (!exists) text = "—";
  else if (value === "") text = '""';
  else if (value !== null && typeof value === "object") {
    const ancestors: object[] = [];
    try {
      text = JSON.stringify(value, function (_key, child) {
        if (typeof child === "bigint") return child.toString();
        if (child === null || typeof child !== "object") return child;
        while (ancestors.length && ancestors[ancestors.length - 1] !== this) ancestors.pop();
        if (ancestors.includes(child)) return "[Circular]";
        ancestors.push(child);
        return child;
      }, pretty ? 2 : undefined) ?? String(value);
    } catch {
      text = "[Unserializable]";
    }
  } else text = String(value);
  const limit = Math.max(1, maxLength);
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

export interface SheetExtraKey {
  key: string;
  path: string[];
  label: string;
  count: number;
  types: string[];
  sample: unknown;
}

/** Discover only loaded rows; arrays remain one field rather than unstable index columns. */
export function discoverSheetKeys(items: readonly unknown[], extraDataKey = "data") {
  const paths = new Map<string, string[]>();
  let truncated = false;
  let full = false;
  const maxKeys = 200;
  const maxDepth = 8;

  function add(path: string[]) {
    const key = sheetPathKey(path);
    if (paths.has(key)) return;
    if (paths.size >= maxKeys) {
      truncated = true;
      full = true;
      return;
    }
    paths.set(key, path);
  }

  function visit(value: object, path: string[], ancestors: Set<object>) {
    if (ancestors.has(value)) {
      truncated = true;
      return;
    }
    ancestors.add(value);
    for (const key in value) {
      if (full) break;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !("value" in descriptor)) continue;
      if (path.length >= maxDepth) {
        truncated = true;
        break;
      }
      const nextPath = [...path, key];
      add(nextPath);
      const child = descriptor.value;
      if (!full && child !== null && typeof child === "object" && !Array.isArray(child)) {
        visit(child, nextPath, ancestors);
      }
    }
    ancestors.delete(value);
  }

  for (const item of items) {
    const root = readSheetPath(item, [extraDataKey]);
    if (!root.exists || root.value === null || root.value === undefined) continue;
    if (typeof root.value === "object" && !Array.isArray(root.value)) {
      visit(root.value, [], new Set());
    } else add([]);
    if (full) break;
  }

  // Count the retained paths across every loaded row, even when discovery hits its cap.
  const keys: SheetExtraKey[] = [...paths].map(([key, path]) => {
    const types = new Set<string>();
    let count = 0;
    let sample: unknown;
    let hasSample = false;
    for (const item of items) {
      const root = readSheetPath(item, [extraDataKey]);
      if (!root.exists) continue;
      const result = readSheetPath(root.value, path);
      if (!result.exists) continue;
      count++;
      types.add(sheetValueType(result.value));
      if (!hasSample || (sample === null && result.value !== null)) {
        sample = result.value;
        hasSample = true;
      }
    }
    const last = path[path.length - 1] ?? extraDataKey;
    const label = last.replace(/[_-]/g, " ").replace(/^./u, (first) => first.toUpperCase());
    return { key, path, label, count, types: [...types], sample };
  });
  keys.sort((a, b) => sheetPathLabel(a.path).localeCompare(sheetPathLabel(b.path)));
  return { keys, truncated, total: items.length };
}

export interface SheetLayout {
  key: string;
  visible: boolean;
  width: number;
  title?: string;
  path?: string[];
}

export interface SheetLayoutDefault {
  key: string;
  visible?: boolean;
  width?: number;
  title?: string;
  path?: readonly string[];
  fixed?: boolean;
  raw?: boolean;
}

/** Restore presentation metadata only; null lets callers preserve unsupported or corrupt storage. */
export function restoreSheetLayout(
  saved: unknown,
  defaults: readonly SheetLayoutDefault[],
): SheetLayout[] | null {
  const own = (source: unknown, key: string) => readSheetPath(source, [key]);
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return null;
  const entries = own(saved, "columns").value;
  if (own(saved, "version").value !== 1 || !Array.isArray(entries) || entries.length > 256 || defaults.length > 256) return null;

  function decode(source: unknown, isDefault = false): SheetLayout | null {
    if (!source || typeof source !== "object" || Array.isArray(source)) return null;
    const key = own(source, "key").value;
    const width = own(source, "width").value ?? (isDefault ? 170 : undefined);
    const visible = own(source, "visible").value ?? (isDefault ? true : undefined);
    if (typeof key !== "string" || !key || key.length > 1200 ||
      typeof width !== "number" || !Number.isFinite(width) || width < 95 || width > 480 ||
      typeof visible !== "boolean") return null;
    const column: SheetLayout = { key, width, visible };
    const title = own(source, "title");
    if (title.exists && title.value !== undefined) {
      if (typeof title.value !== "string" || title.value.length > 120) return null;
      if (title.value) column.title = title.value;
    }
    const path = own(source, "path");
    if (path.exists && path.value !== undefined) {
      if (!Array.isArray(path.value) || path.value.length > 8) return null;
      const segments: string[] = [];
      let length = 0;
      for (let index = 0; index < path.value.length; index++) {
        const segment = own(path.value, String(index));
        if (!segment.exists || typeof segment.value !== "string" || segment.value.length > 160) return null;
        length += segment.value.length;
        if (length > 512) return null;
        segments.push(segment.value);
      }
      if (key !== sheetPathKey(segments)) return null;
      column.path = segments;
    } else if (key.startsWith("extra:")) return null;
    return column;
  }

  const bases = new Map<string, SheetLayout>();
  const fixed = new Set<string>();
  const mandatory = new Set<string>();
  for (let index = 0; index < defaults.length; index++) {
    const source = own(defaults, String(index)).value;
    const column = decode(source, true);
    if (!column || bases.has(column.key)) return null;
    if (own(source, "fixed").value === true) fixed.add(column.key);
    if (fixed.has(column.key) || own(source, "raw").value === true || column.key === "__sheet_extra_data__") {
      mandatory.add(column.key);
      column.visible = true;
    }
    bases.set(column.key, column);
  }

  const restored: SheetLayout[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < entries.length; index++) {
    const column = decode(own(entries, String(index)).value);
    if (!column || seen.has(column.key)) return null;
    seen.add(column.key);
    if (!column.path && !bases.has(column.key)) continue;
    if (mandatory.has(column.key)) column.visible = true;
    restored.push(column);
  }
  for (const [key, column] of bases) {
    if (!seen.has(key)) restored.push(column);
  }
  if (restored.length > 256) return null;
  const result = [
    ...[...bases.keys()].filter(key => fixed.has(key)).map(key => restored.find(column => column.key === key)!),
    ...restored.filter(column => !fixed.has(column.key)),
  ];
  // Three bytes per encoded UTF-16 unit conservatively bounds the serialized UTF-8 metadata.
  if (JSON.stringify({ version: 1, columns: result }).length * 3 > 65536) return null;
  return result;
}
