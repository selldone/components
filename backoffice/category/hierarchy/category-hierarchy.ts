export type Category = {
  id?: number | string;
  title: string;
  icon?: string | null;
  description?: string;
  parent?: { id?: number | string; title?: string } | null;
  visits?: number;
  products?: number;
  categories?: number;
};

export type HierarchyNode = {
  key: string;
  title: string;
  category?: Category;
  parentKey: string | null;
  depth: number;
  children: HierarchyNode[];
};

export function buildCategoryHierarchy(categories: Category[], home: string) {
  const root: HierarchyNode = {
    key: "home",
    title: home,
    parentKey: null,
    depth: 0,
    children: [],
  };
  const nodes: (HierarchyNode & { category: Category; parentKey: string })[] =
    categories.map((category, index) => ({
      key:
        category.id == null
          ? `category-index-${index}`
          : `category-${category.id}`,
      title: category.title,
      category,
      parentKey: root.key,
      depth: 1,
      children: [],
    }));
  const byId = new Map(nodes.map((node) => [node.category.id, node]));
  const byTitle = new Map(nodes.map((node) => [node.title, node]));
  const byKey = new Map([root, ...nodes].map((node) => [node.key, node]));

  nodes.forEach((node) => {
    const parent = node.category.parent;
    const parentNode =
      (parent?.id != null ? byId.get(parent.id) : undefined) ||
      (parent?.title ? byTitle.get(parent.title) : undefined);
    if (parentNode && parentNode !== node) node.parentKey = parentNode.key;
  });

  // A malformed cycle must not make the diagram or mobile tree recurse forever.
  nodes.forEach((node) => {
    const seen = new Set([node.key]);
    let parent = byKey.get(node.parentKey);
    while (parent) {
      if (seen.has(parent.key)) {
        node.parentKey = root.key;
        break;
      }
      seen.add(parent.key);
      parent = parent.parentKey ? byKey.get(parent.parentKey) : undefined;
    }
  });
  nodes.forEach((node) => {
    node.depth = categoryPath(node, byKey).length - 1;
    byKey.get(node.parentKey)!.children.push(node);
  });
  const columns: number[] = [1];
  nodes.forEach(
    (node) => (columns[node.depth] = (columns[node.depth] || 0) + 1),
  );

  return {
    root,
    nodes,
    byKey,
    columns,
    height: Math.max(420, Math.max(...columns) * 58 + 48),
  };
}

export function categoryPath(
  node: HierarchyNode,
  byKey: Map<string, HierarchyNode>,
) {
  const path: HierarchyNode[] = [];
  let current: HierarchyNode | undefined = node;
  while (current) {
    path.unshift(current);
    current = current.parentKey ? byKey.get(current.parentKey) : undefined;
  }
  return path;
}

export function categoryMetric(category: Category, mode: string): number {
  if (mode === "mono") return 1;
  return mode === "visits"
    ? (category.visits ?? 0)
    : (category.products ?? 0) + (category.categories ?? 0);
}

export function escapeCategoryText(value: string) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!,
  );
}
