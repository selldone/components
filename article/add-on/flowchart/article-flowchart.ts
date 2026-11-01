import type {
  ApiDocFlowBlock,
  ApiDocFlowNode,
  ApiDocFlowEdge,
} from "./flow-content";

export const FLOWCHART_TAG = "article-flowchart";
export const MAX_FLOWCHART_BYTES = 65_536;
export const MAX_ARTICLE_FLOWCHARTS = 8;

export function canUseArticleFlowchart(articleType: unknown): boolean {
  return articleType === "help" || articleType === "blog";
}

const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

function shape(
  value: unknown,
  allowed: string[],
  required: string[],
): value is Record<string, unknown> {
  return (
    record(value) &&
    Object.keys(value).every((key) => allowed.includes(key)) &&
    required.every((key) => Object.hasOwn(value, key))
  );
}

function text(value: unknown, limit: number, empty = true): string | null {
  if (
    typeof value !== "string" ||
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F<>]/.test(value)
  )
    return null;
  const result = value.trim();
  const characters = Array.from(result);
  if (
    (!empty && !result) ||
    characters.length > limit ||
    characters.some((character) => {
      const code = character.codePointAt(0)!;
      return code >= 0xd800 && code <= 0xdfff;
    })
  )
    return null;
  return result;
}

/** Strict article boundary; the source-authored API catalog retains its own permissive normalizer. */
export function parseArticleFlowchart(value: unknown): ApiDocFlowBlock | null {
  try {
    if (typeof value === "string") {
      if (
        value.length > MAX_FLOWCHART_BYTES ||
        new TextEncoder().encode(value).length > MAX_FLOWCHART_BYTES
      )
        return null;
      value = JSON.parse(value);
    }
    if (
      !shape(
        value,
        ["type", "title", "description", "nodes", "edges", "animated"],
        ["type", "title", "nodes", "edges"],
      ) ||
      value.type !== "flow" ||
      !Array.isArray(value.nodes) ||
      value.nodes.length < 2 ||
      value.nodes.length > 6 ||
      !Array.isArray(value.edges) ||
      value.edges.length > 12 ||
      (Object.hasOwn(value, "animated") && typeof value.animated !== "boolean")
    )
      return null;
    const title = text(value.title, 160, false);
    const description = text(
      Object.hasOwn(value, "description") ? value.description : "",
      2000,
    );
    if (title === null || description === null) return null;
    const nodes: ApiDocFlowNode[] = [];
    const ids = new Set<string>();
    for (const input of value.nodes) {
      if (
        !shape(
          input,
          ["id", "label", "description", "icon", "caption", "outcome"],
          ["id", "label"],
        )
      )
        return null;
      const id = text(input.id, 60, false);
      const label = text(input.label, 160, false);
      const detail = text(
        Object.hasOwn(input, "description") ? input.description : "",
        500,
      );
      const icon = text(
        Object.hasOwn(input, "icon") ? input.icon : "circle",
        40,
        false,
      );
      const caption = text(
        Object.hasOwn(input, "caption") ? input.caption : "",
        90,
      );
      if (
        id === null ||
        !/^[A-Za-z][A-Za-z0-9_-]{0,59}$/.test(id) ||
        ids.has(id) ||
        label === null ||
        detail === null ||
        icon === null ||
        !/^[a-z][a-z0-9_]{0,39}$/.test(icon) ||
        caption === null
      )
        return null;
      ids.add(id);
      let outcome: ApiDocFlowNode["outcome"] = null;
      if (input.outcome !== undefined && input.outcome !== null) {
        if (!shape(input.outcome, ["label", "tone"], ["label", "tone"]))
          return null;
        const outcomeLabel = text(input.outcome.label, 80, false);
        const tone = input.outcome.tone;
        if (
          outcomeLabel === null ||
          (tone !== "success" &&
            tone !== "error" &&
            tone !== "warning" &&
            tone !== "neutral")
        )
          return null;
        outcome = { label: outcomeLabel, tone };
      }
      nodes.push({ id, label, description: detail, icon, caption, outcome });
    }
    const edges: ApiDocFlowEdge[] = [];
    for (const input of value.edges) {
      if (!shape(input, ["from", "to", "label"], ["from", "to"])) return null;
      const from = text(input.from, 60, false);
      const to = text(input.to, 60, false);
      const label = text(Object.hasOwn(input, "label") ? input.label : "", 240);
      if (
        from === null ||
        to === null ||
        !ids.has(from) ||
        !ids.has(to) ||
        from === to ||
        label === null
      )
        return null;
      edges.push({ from, to, label });
    }
    const flow: ApiDocFlowBlock = {
      type: "flow",
      title,
      description,
      nodes,
      edges,
      animated: value.animated === true,
    };
    return new TextEncoder().encode(JSON.stringify(flow)).length <=
      MAX_FLOWCHART_BYTES
      ? flow
      : null;
  } catch {
    return null;
  }
}

/** The editor may contain rendered descendants; serialization always rebuilds the empty inert marker. */
export function parseArticleFlowchartElement(
  element: Element,
): ApiDocFlowBlock | null {
  return element.localName === FLOWCHART_TAG &&
    element.getAttribute("data-version") === "1"
    ? parseArticleFlowchart(element.getAttribute("data-flow"))
    : null;
}

export function serializeArticleFlowchart(value: unknown): string | null {
  const flow = parseArticleFlowchart(value);
  if (!flow) return null;
  const json = JSON.stringify(flow)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<${FLOWCHART_TAG} data-version="1" data-flow="${json}"></${FLOWCHART_TAG}>`;
}

/** The same branching grammar used by API Docs: meaningful outcomes, captions, icons and measured curves. */
export function createArticleFlowchart(): ApiDocFlowBlock {
  return {
    type: "flow",
    title: "From request to outcome",
    description:
      "Check the request, then follow the successful or unsuccessful result.",
    animated: true,
    nodes: [
      {
        id: "request",
        label: "Request received",
        description: "A customer sends a request to the business.",
        icon: "inbox",
        caption: "New request",
        outcome: { label: "Ready to check", tone: "neutral" },
      },
      {
        id: "check",
        label: "Check the details",
        description: "Validate the information before continuing.",
        icon: "fact_check",
        caption: "Validate required information",
        outcome: { label: "Decision", tone: "warning" },
      },
      {
        id: "success",
        label: "Continue the work",
        description:
          "The required information is complete and the operation can continue.",
        icon: "task_alt",
        caption: "Accepted request",
        outcome: { label: "Success", tone: "success" },
      },
      {
        id: "failure",
        label: "Request a correction",
        description:
          "Explain the missing information so the customer can correct it.",
        icon: "error_outline",
        caption: "Information needs attention",
        outcome: { label: "Needs correction", tone: "error" },
      },
    ],
    edges: [
      { from: "request", to: "check", label: "Review" },
      { from: "check", to: "success", label: "Valid" },
      { from: "check", to: "failure", label: "Missing information" },
    ],
  };
}

export const ARTICLE_FLOWCHART_SCHEMA = `type Flow = {
  type: "flow";
  title: string; // required, 1–160 characters
  description?: string; // 0–2000 characters, default ""
  animated?: boolean; // default false; one automatic story under 4 seconds
  nodes: { // 2–6 nodes; unique IDs
    id: string; // /^[A-Za-z][A-Za-z0-9_-]{0,59}$/
    label: string; // required, 1–160 characters
    description?: string; // 0–500 characters, default ""
    icon?: string; // Material icon /^[a-z][a-z0-9_]{0,39}$/, default "circle"
    caption?: string; // 0–90 characters, default ""
    outcome?: null | { label: string; tone: "success" | "error" | "warning" | "neutral" }; // label 1–80 characters
  }[];
  edges: { from: string; to: string; label?: string }[]; // 0–12 edges; existing distinct node IDs; label 0–240 characters
};
Only these fields are accepted. Use plain text without HTML, SVG or control characters. No URL, href, action, script or style fields. Cycles are supported. Maximum JSON size: 65536 UTF-8 bytes. Maximum eight diagrams per article. Return one JSON object, without Markdown fences or HTML.`;
