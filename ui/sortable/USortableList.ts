import Sortable, { type MoveEvent, type Options, type SortableEvent } from "sortablejs";
import {
  cloneVNode,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  shallowRef,
  TransitionGroup,
  watch,
  type ComponentPublicInstance,
  type PropType,
  type PublicProps,
  type SetupContext,
  type SlotsType,
  type VNode,
} from "vue";

type Position<Item> = { element: Item; index: number };

type Change<Item> =
  | { moved: { element: Item; oldIndex: number; newIndex: number } }
  | { added: { element: Item; newIndex: number } }
  | { removed: { element: Item; oldIndex: number } };

type MoveGuard<Item> = (event: {
  draggedContext: Position<Item> & { futureIndex: number };
}) => boolean;

interface ListProps<Item> {
  modelValue?: readonly Item[];
  itemKey?: string | ((item: Item) => PropertyKey | undefined);
  tag?: "div" | "ol" | "ul" | "transition-group";
  componentData?: { tag: "ul"; name?: string };
  animation?: number | string;
  chosenClass?: string;
  delay?: number;
  delayOnTouchOnly?: boolean;
  disabled?: boolean;
  dragClass?: string;
  fallbackTolerance?: number;
  filter?: string;
  ghostClass?: string;
  group?: Options["group"];
  handle?: string;
  move?: MoveGuard<Item>;
  touchStartThreshold?: number;
}

type ListEvents<Item> = {
  "update:modelValue": (items: Item[]) => void;
  change: (change: Change<Item>) => void;
  start: (event: SortableEvent) => void;
  end: (event: SortableEvent) => void;
};

type ItemSlots<Item> = {
  item: (scope: Position<Item>) => VNode[];
  footer?: () => VNode[];
};

type ListPublicProps<Item> = ListProps<Item> & PublicProps & {
  [Event in keyof ListEvents<Item> as `on${Capitalize<Event>}`]?: ListEvents<Item>[Event];
};

const activeLists = new WeakMap<HTMLElement, (element: unknown, index: number) => boolean>();
const itemSelector = "[data-sortable-item]";
const ungrouped = { name: "" };

function setup<Item>(
  props: ListProps<Item>,
  { attrs, emit, slots }: SetupContext<ListEvents<Item>, SlotsType<ItemSlots<Item>>>,
) {
  const root = shallowRef<HTMLElement>();
  const itemKeys = new WeakMap<object, symbol>();
  let sortable: Sortable | undefined;
  let drag: Position<Item> | undefined;

  function notify(items: Item[], change: Change<Item>) {
    emit("update:modelValue", items);
    void nextTick(() => emit("change", change));
  }

  function onStart(event: SortableEvent) {
    const index = event.oldDraggableIndex ?? event.oldIndex;
    const items = props.modelValue ?? [];
    if (index !== undefined && index in items) {
      drag = { index, element: items[index] };
    }
    void nextTick(() => emit("start", event));
  }

  function onMove(event: MoveEvent) {
    if (!drag || !props.move) return true;
    const rows = Array.from(event.to.children).filter(
      (row) => row.matches(itemSelector) && row !== event.dragged && row !== Sortable.clone,
    );
    const relatedIndex = rows.indexOf(event.related);
    const futureIndex = relatedIndex < 0
      ? rows.length
      : relatedIndex + Number(event.willInsertAfter);
    return props.move({ draggedContext: { ...drag, futureIndex } });
  }

  function onEnd(event: SortableEvent) {
    const position = drag;
    drag = undefined;
    commitDrop(event, position);
    void nextTick(() => emit("end", event));
  }

  function commitDrop(event: SortableEvent, position: Position<Item> | undefined) {
    const { item, from, to, oldIndex, newIndex, newDraggableIndex } = event;
    if (from === to && oldIndex === newIndex) return;

    const items = [...(props.modelValue ?? [])];
    const updatedDuringDrag = position && items[position.index] !== position.element;
    // Undo Sortable's DOM move before Vue patches its keyed children.
    const siblings = Array.from(from.children).filter(
      (node) => node !== item && node !== event.clone,
    );
    if (event.pullMode === "clone") event.clone?.remove();
    if (updatedDuringDrag) {
      const key = keyFor(position.element, position.index);
      const index = items.findIndex((element, index) => keyFor(element, index) === key);
      if (index < 0) {
        item.remove();
      } else {
        const rows = siblings.filter((node) => node.matches(itemSelector));
        const footer = siblings.find((node) => !node.matches(itemSelector));
        from.insertBefore(item, rows[index] ?? footer ?? null);
      }
      return;
    }

    from.insertBefore(item, siblings[oldIndex ?? 0] ?? null);
    if (!position || props.disabled || newDraggableIndex === undefined) return;
    const { index, element } = position;
    if (from === to) {
      if (index === newDraggableIndex) return;
      items.splice(index, 1);
      items.splice(newDraggableIndex, 0, element);
      notify(items, { moved: { element, oldIndex: index, newIndex: newDraggableIndex } });
      return;
    }

    const insert = activeLists.get(to);
    if (!insert?.(element, newDraggableIndex)) return;
    if (event.pullMode !== "clone") {
      items.splice(index, 1);
      notify(items, { removed: { element, oldIndex: index } });
    }
  }

  function options(): Options {
    return {
      animation: Number(props.animation ?? 0),
      chosenClass: props.chosenClass ?? "sortable-chosen",
      delay: props.delay ?? 0,
      delayOnTouchOnly: props.delayOnTouchOnly ?? false,
      disabled: props.disabled ?? false,
      dragClass: props.dragClass ?? "sortable-drag",
      fallbackTolerance: props.fallbackTolerance ?? 0,
      filter: props.filter ?? "",
      ghostClass: props.ghostClass ?? "sortable-ghost",
      group: props.group ?? ungrouped,
      handle: props.handle ?? "",
      touchStartThreshold: props.touchStartThreshold ??
        (typeof window === "undefined" ? 1 : Math.floor(window.devicePixelRatio || 1)),
    };
  }

  function detach() {
    if (!sortable) return;
    drag = undefined;
    activeLists.delete(sortable.el);
    sortable.destroy();
    sortable = undefined;
  }

  watch(root, (element) => {
    detach();
    if (!element) return;
    activeLists.set(element, (value, newIndex) => {
      if (props.disabled) return false;
      // Lists in a Sortable group share the same item type.
      const item = value as Item;
      const items = [...(props.modelValue ?? [])];
      items.splice(newIndex, 0, item);
      notify(items, { added: { element: item, newIndex } });
      return true;
    });
    sortable = Sortable.create(element, {
      ...options(),
      draggable: `>${itemSelector}`,
      onStart,
      onMove,
      onEnd,
    });
  }, { flush: "post" });

  watch(options, (settings, previous) => {
    for (const name of Object.keys(settings) as (keyof Options)[]) {
      if (settings[name] !== previous[name]) sortable?.option(name, settings[name]);
    }
  }, { flush: "post" });

  onBeforeUnmount(detach);

  function setRoot(value: Element | ComponentPublicInstance | null) {
    const element = value && "$el" in value ? value.$el : value;
    root.value = element instanceof HTMLElement ? element : undefined;
  }

  function keyFor(element: Item, index: number): PropertyKey {
    if (typeof props.itemKey === "function") {
      const key = props.itemKey(element);
      if (key !== undefined) return key;
    }
    if (element !== null && typeof element === "object") {
      const key = (element as Record<string, unknown>)[
        typeof props.itemKey === "string" ? props.itemKey : "id"
      ];
      if (typeof key === "number" || typeof key === "string" || typeof key === "symbol") return key;
      if (!itemKeys.has(element)) itemKeys.set(element, Symbol());
      return itemKeys.get(element)!;
    }
    return typeof element === "number" || typeof element === "string" || typeof element === "symbol"
      ? element
      : index;
  }

  return () => {
    const keys = new Set<PropertyKey>();
    const rows = (props.modelValue ?? []).map((element, index) => {
      const row = slots.item?.({ element, index })[0];
      if (!row) return null;
      let key = keyFor(element, index);
      if (keys.has(key)) key = `duplicate-sortable-item-${index}`;
      keys.add(key);
      return cloneVNode(row, { key, "data-sortable-item": "" });
    });
    const children = [...rows, ...(slots.footer?.() ?? [])];
    const rootAttrs = { ...attrs, ref: setRoot };
    return props.tag === "transition-group"
      ? h(TransitionGroup, { ...props.componentData, ...rootAttrs }, () => children)
      : h(props.tag ?? "div", rootAttrs, children);
  };
}

const USortableList = defineComponent(setup, {
  name: "USortableList",
  inheritAttrs: false,
  props: {
    modelValue: Array as PropType<readonly unknown[]>,
    itemKey: [String, Function] as PropType<ListProps<unknown>["itemKey"]>,
    tag: String as PropType<ListProps<unknown>["tag"]>,
    componentData: Object as PropType<ListProps<unknown>["componentData"]>,
    animation: [Number, String],
    chosenClass: String,
    delay: Number,
    delayOnTouchOnly: Boolean,
    disabled: Boolean,
    dragClass: String,
    fallbackTolerance: Number,
    filter: String,
    ghostClass: String,
    group: [String, Object] as PropType<Options["group"]>,
    handle: String,
    move: Function as PropType<MoveGuard<unknown>>,
    touchStartThreshold: Number,
  },
  emits: {
    "update:modelValue": (_items: unknown[]) => true,
    change: (_event: Change<unknown>) => true,
    start: (_event: SortableEvent) => true,
    end: (_event: SortableEvent) => true,
  },
  slots: Object as SlotsType<ItemSlots<unknown>>,
});

// Vue's runtime prop declarations erase the row type. Keep it inferred from modelValue.
export default USortableList as unknown as {
  new <Item>(props: ListPublicProps<Item>): {
    $props: ListPublicProps<Item>;
    $slots: ItemSlots<Item>;
  };
};
