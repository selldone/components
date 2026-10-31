<!-- Copyright (c) 2023-2026. Selldone® Business OS™ -->
<template>
  <div class="category-graph text-start">
    <div class="category-graph__toolbar">
      <div>
        <h2>{{ $t("admin_shop.categories.graph.connections_title") }}</h2>
        <p>{{ $t(`admin_shop.categories.graph.${mode_description}`) }}</p>
      </div>
      <v-btn-toggle
        v-model="mode"
        class="category-graph__modes"
        :aria-label="$t('admin_shop.categories.graph.connection_width')"
        mandatory
        @update:model-value="hovered = null"
      >
        <v-btn value="mono" variant="text">{{
          $t("admin_shop.categories.graph.normal")
        }}</v-btn>
        <v-btn value="visits" variant="text">{{
          $t("admin_shop.categories.graph.visits_count")
        }}</v-btn>
        <v-btn value="count" variant="text">{{
          $t("admin_shop.categories.graph.items_count")
        }}</v-btn>
      </v-btn-toggle>
    </div>

    <div class="category-graph__desktop">
      <div
        class="category-graph__scroll"
        dir="ltr"
        :aria-label="$t('admin_shop.categories.graph.connections_title')"
        tabindex="0"
        @chart-updated="decorateChart"
      >
        <div
          class="category-graph__levels sd-modern-list-header dir-ltr"
          :style="{
            minWidth: `${Math.max(680, hierarchy.columns.length * column_width) - 48}px`,
          }"
          aria-hidden="true"
        >
          <span
            v-for="(_, level) in hierarchy.columns"
            :key="level"
            :style="{
              insetInlineStart: `${(level * 100) / Math.max(1, hierarchy.columns.length - 1)}%`,
            }"
            >{{ levelLabel(level) }}</span
          >
        </div>
        <u-chart-sankey
          v-if="hierarchy.nodes.length"
          ref="chart"
          :config="chartConfig"
          :data="chart_data"
          :duration="0"
          :style="{
            height: `${height ?? hierarchy.height}px`,
            minWidth: `${Math.max(680, hierarchy.columns.length * column_width)}px`,
          }"
          class="category-graph__chart dir-ltr"
          @rendered="decorateChart"
        />
      </div>
    </div>

    <div class="category-graph__mobile">
      <p class="sd-modern-muted">
        {{ $t("admin_shop.categories.graph.mobile_hint") }}
      </p>
      <category-hierarchy-tree
        :nodes="hierarchy.root.children"
        :mode="mode"
        :selected="selected"
        :can-edit="canEdit"
        @select="selectNode"
        @edit="$emit('edit', $event)"
      />
    </div>

    <v-tooltip
      :model-value="Boolean(tooltip_target)"
      :target="tooltip_target || undefined"
      :text="tooltip_text"
      :id="tooltip_id"
      content-class="sd-modern-tooltip text-start"
      location="top"
      @update:model-value="!$event && (tooltip_target = null)"
    />
    <div class="category-graph__details" aria-live="polite">
      <div class="category-graph__path">
        <v-icon size="16" aria-hidden="true">subdirectory_arrow_right</v-icon>
        <span
          ><span class="sr-only"
            >{{ $t("admin_shop.categories.graph.path_label") }}: </span
          >{{ active_path }}</span
        >
        <v-tooltip
          v-if="selected"
          :text="$t('admin_shop.categories.graph.clear_selection')"
          content-class="sd-modern-tooltip text-start"
          location="top"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :aria-label="$t('admin_shop.categories.graph.clear_selection')"
              class="sd-modern-icon-button"
              variant="text"
              icon="close"
              @click="
                selected = null;
                hovered = null;
              "
            />
          </template>
        </v-tooltip>
      </div>
      <p
        v-if="active_node?.category?.description"
        class="category-graph__description"
      >
        {{ active_node.category.description }}
      </p>
      <div v-if="active_node?.category" class="category-graph__counts">
        <span>{{
          $t("admin_shop.categories.graph.products_count", {
            count: formatCount(active_node.category.products),
          })
        }}</span>
        <span>{{
          $t("admin_shop.categories.graph.subcategories_count", {
            count: formatCount(active_node.category.categories),
          })
        }}</span>
        <span>{{
          $t("admin_shop.categories.graph.visits_value", {
            count: formatCount(active_node.category.visits),
          })
        }}</span>
      </div>
      <p
        v-if="mode !== 'mono' && !has_activity"
        class="category-graph__description"
      >
        {{ $t("admin_shop.categories.graph.no_activity") }}
      </p>
    </div>
    <div class="category-graph__footer sd-modern-muted">
      <span class="category-graph__drag-hint"
        ><v-icon size="15" aria-hidden="true">swap_vert</v-icon
        >{{ $t("admin_shop.categories.graph.drag_hint") }}</span
      >
      <span>{{ $t("admin_shop.categories.graph.select_hint") }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { select } from "d3-selection";
import UChartSankey from "../../../ui/chart/sankey/UChartSankey.vue";
import CategoryHierarchyTree from "./CategoryHierarchyTree.vue";
import {
  buildCategoryHierarchy,
  categoryMetric,
  categoryPath,
  escapeCategoryText,
} from "./category-hierarchy";

export default {
  name: "CategoriesGraph",
  components: { UChartSankey, CategoryHierarchyTree },
  emits: ["edit"],
  props: {
    categories: { type: Array, required: true },
    height: { type: Number, default: undefined },
    canEdit: Boolean,
  },
  data: () => ({
    mode: "mono",
    selected: null,
    hovered: null,
    tooltip_target: null,
    tooltip_text: "",
  }),
  computed: {
    column_width() {
      return this.canEdit ? 260 : 200;
    },
    tooltip_id() {
      return `category-graph-tooltip-${this.$.uid}`;
    },
    hierarchy() {
      return buildCategoryHierarchy(
        this.categories,
        this.$t("admin_shop.categories.graph.home"),
      );
    },
    mode_description() {
      return this.mode === "mono"
        ? "structure_description"
        : this.mode === "visits"
          ? "visits_description"
          : "items_description";
    },
    active_node() {
      return this.hierarchy.byKey.get(this.hovered || this.selected);
    },
    active_path() {
      return this.active_node
        ? categoryPath(this.active_node, this.hierarchy.byKey)
            .map((node) => node.title)
            .join(" → ")
        : `${this.hierarchy.root.title} → ${this.$t("admin_shop.categories.graph.all_categories")}`;
    },
    active_keys() {
      if (!this.active_node) return null;
      const keys = new Set(
        categoryPath(this.active_node, this.hierarchy.byKey).map(
          (node) => node.key,
        ),
      );
      this.hierarchy.nodes.forEach((node) => {
        if (
          categoryPath(node, this.hierarchy.byKey).some(
            (parent) => parent.key === this.active_node.key,
          )
        )
          keys.add(node.key);
      });
      return keys;
    },
    has_activity() {
      return this.hierarchy.nodes.some(
        (node) => categoryMetric(node.category, this.mode) > 0,
      );
    },
    chart_data() {
      const nodeTooltip = (node) => {
        const description = node.category?.description;
        const metric =
          node.category && this.mode !== "mono"
            ? ` · ${this.formatCount(categoryMetric(node.category, this.mode))}`
            : "";
        return `<b>${escapeCategoryText(node.title)}</b>${escapeCategoryText(metric)}${description ? `<br>${escapeCategoryText(description)}` : ""}`;
      };
      return {
        padding: 24,
        nodes: [this.hierarchy.root, ...this.hierarchy.nodes].map((node) => {
          const metric =
            node.category && this.mode !== "mono"
              ? ` · ${this.formatCount(categoryMetric(node.category, this.mode))}`
              : "";
          const limit = Math.max(
            10,
            28 -
              metric.length -
              (node.category ? 4 : 0) -
              (this.canEdit ? 4 : 0),
          );
          return {
            key: node.key,
            name:
              (node.title.length > limit
                ? `${node.title.slice(0, limit - 1)}…`
                : node.title) + metric,
            tooltip: nodeTooltip(node),
            color: "var(--category-graph-link)",
          };
        }),
        links: this.hierarchy.nodes.map((node) => {
          const value = categoryMetric(node.category, this.mode);
          const parent = this.hierarchy.byKey.get(node.parentKey);
          return {
            source: node.parentKey,
            target: node.key,
            // Keep zero-activity labels in the layout; their connections stay hidden.
            value: value || 0.000001,
            actualValue: value,
            tooltip: `${escapeCategoryText(parent.title)} → ${escapeCategoryText(node.title)}: ${this.formatCount(value)}`,
            sourceColor: "var(--category-graph-link)",
            targetColor: "var(--category-graph-link)",
          };
        }),
      };
    },
  },
  watch: {
    categories() {
      this.selected = null;
      this.hovered = null;
      this.tooltip_target = null;
    },
    active_keys() {
      this.highlightChart();
    },
  },
  methods: {
    chartConfig(chart) {
      const sankey = chart.sankey();
      sankey.nodeKey((node) => node.key).nodeDraggableY(true);
      sankey
        .sankey()
        .nodeWidth(4)
        .nodePadding(this.canEdit ? 46 : 42)
        .nodeAlign((node) => node.depth);
    },
    formatCount(value) {
      return value == null ? "—" : this.$n(Number(value));
    },
    levelLabel(level) {
      const keys = ["store", "categories_level", "subcategories_level"];
      return this.$t(
        `admin_shop.categories.graph.${keys[level] || "next_level"}`,
        { level },
      );
    },
    selectNode(key) {
      this.selected = this.selected === key ? null : key;
      this.hovered = null;
    },
    editNode(key) {
      const category = this.hierarchy.byKey.get(key)?.category;
      if (!this.canEdit || category?.id == null) return;
      this.tooltip_target = null;
      this.$emit("edit", category);
    },
    decorateChart() {
      const chart = this.$refs.chart?.$el;
      if (!chart) return;
      const component = this;
      select(chart)
        .selectAll(".d2b-sankey-node")
        .each(function (node) {
          const group = select(this);
          const item = component.hierarchy.byKey.get(node.key);
          if (!item) return;
          const editable = component.canEdit && item.category?.id != null;
          group
            .attr("tabindex", null)
            .attr("role", "group")
            .attr(
              "aria-label",
              categoryPath(item, component.hierarchy.byKey)
                .map((entry) => entry.title)
                .join(" → "),
            )
            .attr("aria-describedby", component.tooltip_id)
            .on("mouseenter.category focusin.category", (event) => {
              if (event.target.closest?.(".category-graph__edit-button"))
                return;
              component.hovered = node.key;
              component.tooltip_target = this;
              component.tooltip_text = [item.title, item.category?.description]
                .filter(Boolean)
                .join(" · ");
            })
            .on("mouseleave.category focusout.category", () => {
              component.hovered = null;
              component.tooltip_target = null;
            })
            .on("click.category", () => component.selectNode(node.key))
            .on("keydown.category", (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                component.selectNode(node.key);
              } else if (event.key === "Escape") {
                component.selected = null;
                component.hovered = null;
                component.tooltip_target = null;
              }
            });
          const text = group.select("text").node();
          if (!text) return;
          // Keep editable cards on the same side of each column so neighboring controls cannot overlap.
          if (component.canEdit && item.category) {
            select(text).classed("d2b-text-anchor-end", true).attr("x", -6);
            select(text).selectAll("tspan").attr("x", -6);
          }
          select(text)
            .attr("tabindex", 0)
            .attr("role", "button")
            .attr("aria-label", group.attr("aria-label"))
            .attr("aria-describedby", component.tooltip_id);
          const actionSpace = editable ? 44 : 0;
          const textShift = text.classList.contains("d2b-text-anchor-end")
            ? actionSpace
            : 0;
          select(text).attr(
            "transform",
            textShift ? `translate(-${textShift},0)` : null,
          );
          const nativeBox = text.getBBox();
          const box = {
            x: nativeBox.x - textShift,
            y: nativeBox.y,
            width: nativeBox.width,
            height: nativeBox.height,
          };
          const avatarSpace = item.category ? 28 : 0;
          group
            .selectAll(".category-graph__label-background")
            .data([node])
            .join((enter) => enter.insert("rect", "text"))
            .attr("class", "category-graph__label-background")
            .attr("x", box.x - 10 - avatarSpace)
            .attr("y", box.y + box.height / 2 - (editable ? 22 : 17))
            .attr("width", box.width + 20 + avatarSpace + actionSpace)
            .attr("height", editable ? 44 : 34)
            .attr("rx", 6);
          const avatar = group
            .selectAll(".category-graph__avatar")
            .data(item.category ? [item] : [])
            .join("foreignObject")
            .attr("class", "category-graph__avatar")
            .attr("aria-hidden", "true")
            .attr("x", box.x - 28)
            .attr("y", box.y + box.height / 2 - 10)
            .attr("width", 20)
            .attr("height", 20);
          const avatarContent = avatar
            .selectAll("div")
            .data([item])
            .join("xhtml:div")
            .attr("class", "category-graph__avatar-content");
          avatarContent
            .selectAll("span")
            .data([item])
            .join("xhtml:span")
            .attr("class", "material-icons")
            .text("folder");
          avatarContent
            .selectAll("img")
            .data(item.category?.icon ? [item.category.icon] : [])
            .join("xhtml:img")
            .each(function (icon) {
              const src = component.getShopImagePath(icon, 64);
              if (this.getAttribute("src") !== src) {
                this.hidden = false;
                this.setAttribute("src", src);
              }
            })
            .attr("alt", "")
            .attr("width", 20)
            .attr("height", 20)
            .attr("loading", "lazy")
            .attr("decoding", "async")
            .on("error.category", function () {
              this.hidden = true;
            });
          const editControl = group
            .selectAll(".category-graph__edit")
            .data(editable ? [item] : [])
            .join("foreignObject")
            .attr("class", "category-graph__edit")
            .attr("x", box.x + box.width + 6)
            .attr("y", box.y + box.height / 2 - 22)
            .attr("width", 44)
            .attr("height", 44);
          const editLabel = `${component.$t("global.actions.edit")} · ${item.title}`;
          const editButton = editControl
            .selectAll("button")
            .data([item])
            .join("xhtml:button")
            .attr("type", "button")
            .attr("class", "sd-modern-icon-button category-graph__edit-button")
            .attr("aria-label", editLabel)
            .attr("aria-describedby", component.tooltip_id)
            .on(
              "pointerdown.edit mousedown.edit touchstart.edit keydown.edit",
              (event) => {
                event.stopPropagation();
                if (event.key === "Escape") component.tooltip_target = null;
              },
            )
            .on("click.edit", (event) => {
              event.stopPropagation();
              component.editNode(item.key);
            })
            .on("mouseenter.edit focus.edit", function () {
              component.tooltip_target = this;
              component.tooltip_text = editLabel;
            })
            .on("mouseleave.edit blur.edit", () => {
              component.tooltip_target = null;
            });
          editButton
            .selectAll("span")
            .data([item])
            .join("xhtml:span")
            .attr("class", "material-icons")
            .attr("aria-hidden", "true")
            .text("settings");
          group
            .selectAll("title")
            .data([item.title])
            .join("title")
            .text((title) => title);
        });
      // The native renderer owns drag/layout; shared Vuetify tooltips own accessible details.
      this.$refs.chart.generator
        .nodeTooltip()
        .clear(select(chart).selectAll(".d2b-sankey-node"));
      this.$refs.chart.generator
        .linkTooltip()
        .clear(select(chart).selectAll(".d2b-sankey-link"));
      select(chart)
        .selectAll(".d2b-sankey-link")
        .attr("tabindex", 0)
        .attr("role", "img")
        .attr("aria-label", (link) => this.linkDetail(link))
        .attr("aria-describedby", this.tooltip_id)
        .on("mouseenter.category focus.category", function (event, link) {
          component.tooltip_target = this;
          component.tooltip_text = component.linkDetail(link);
        })
        .on("mouseleave.category blur.category", () => {
          component.tooltip_target = null;
        })
        .on("keydown.category", (event) => {
          if (event.key === "Escape") component.tooltip_target = null;
        });
      this.highlightChart();
    },
    linkDetail(link) {
      const source = this.hierarchy.byKey.get(link.sourceKey)?.title;
      const target = this.hierarchy.byKey.get(link.targetKey)?.title;
      return `${source} → ${target}: ${this.formatCount(link.data.actualValue)}`;
    },
    highlightChart() {
      const chart = this.$refs.chart?.$el;
      if (!chart) return;
      const keys = this.active_keys;
      select(chart)
        .selectAll(".d2b-sankey-node")
        .classed("category-graph__node-active", (node) =>
          Boolean(keys?.has(node.key)),
        );
      select(chart)
        .selectAll(".d2b-sankey-node text")
        .attr("aria-pressed", (node) => String(node.key === this.selected));
      select(chart)
        .selectAll(".d2b-sankey-link")
        .classed("category-graph__link-zero", (link) => !link.data.actualValue)
        .classed("category-graph__link-active", (link) =>
          Boolean(keys?.has(link.sourceKey) && keys?.has(link.targetKey)),
        )
        .classed("category-graph__link-muted", (link) =>
          Boolean(
            keys && !(keys.has(link.sourceKey) && keys.has(link.targetKey)),
          ),
        );
    },
  },
};
</script>

<style lang="scss" scoped>
.category-graph {
  --category-graph-link: rgba(var(--v-theme-on-surface), 0.3);
  color: rgb(var(--v-theme-on-surface));

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    padding: 22px 24px 20px;

    h2 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      line-height: 22px;
    }
    p {
      margin: 4px 0 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 19px;
    }
  }

  &__modes {
    height: auto;
    padding: 4px;
    gap: 4px;
    background: rgba(var(--v-theme-on-surface), 0.035);
    border-radius: 11px !important;

    :deep(.v-btn) {
      min-width: 0;
      height: 32px;
      padding: 5px 12px;
      border-radius: 8px !important;
      color: var(--sd-modern-muted);
      font: inherit;
      font-size: 12px;
      font-weight: 500;
      line-height: 20px;
      letter-spacing: 0;
      text-indent: 0;
      text-transform: none;
    }
    :deep(.v-btn--active) {
      background: rgb(var(--v-theme-surface));
      color: rgb(var(--v-theme-on-surface));
      box-shadow: 0 1px 4px rgba(var(--v-theme-on-surface), 0.08);
      .v-btn__overlay {
        opacity: 0 !important;
      }
    }
    :deep(.v-btn__content) {
      font: inherit;
    }
  }

  &__levels {
    position: relative;
    min-height: 44px;
    margin-inline: 24px;
    padding: 14px 0;
    background: rgb(var(--v-theme-surface));
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
    span {
      position: absolute;
      inset-block-start: 14px;
      white-space: nowrap;
    }
    span:last-child {
      transform: translateX(-100%);
    }
  }

  &__scroll {
    overflow-x: auto;
    margin-inline: 12px;
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: -2px;
    }
  }

  &__chart {
    width: 100%;
    :deep(.category-graph__edit-button) {
      box-sizing: border-box;
      margin: 4px;

      .material-icons {
        font-size: 20px;
        line-height: 1;
      }
      &:focus-visible {
        outline: 2px solid rgb(var(--v-theme-primary));
        outline-offset: -2px;
      }
    }
    @media (pointer: coarse) {
      :deep(.category-graph__edit-button) {
        margin: 0;
      }
    }
    :deep(.category-graph__avatar) {
      pointer-events: none;
    }
    :deep(.category-graph__avatar-content) {
      position: relative;
      display: grid;
      place-items: center;
      width: 20px;
      height: 20px;
      overflow: hidden;
      border-radius: 4px;
      color: var(--sd-modern-muted);

      .material-icons {
        font-size: 18px;
        line-height: 20px;
      }
      img {
        position: absolute;
        inset: 0;
        width: 20px;
        height: 20px;
        object-fit: cover;
      }
    }
    :deep(.d2b-sankey-link) {
      path,
      rect {
        opacity: 0.6;
      }
    }
    :deep(.d2b-sankey-node) {
      cursor: grab;
      text {
        fill: rgb(var(--v-theme-on-surface));
        font-family: inherit;
        font-size: 12px;
        font-weight: 400;
      }
      > rect:first-child {
        opacity: 0.7;
        stroke: none;
      }
      .category-graph__label-background {
        fill: rgb(var(--v-theme-surface));
        stroke: rgba(var(--v-theme-on-surface), 0.12);
        stroke-width: 1px;
        opacity: 1;
      }
      &:active {
        cursor: grabbing;
      }
      &:focus-within {
        outline: none;
        .category-graph__label-background {
          stroke: rgb(var(--v-theme-primary));
          stroke-width: 2px;
        }
      }
      &.category-graph__node-active .category-graph__label-background {
        stroke: rgba(var(--v-theme-primary), 0.6);
      }
    }
    :deep(.category-graph__link-active) {
      path {
        stroke: rgb(var(--v-theme-primary)) !important;
        opacity: 0.42;
      }
      rect {
        fill: rgb(var(--v-theme-primary)) !important;
        opacity: 0.42;
      }
    }
    :deep(.category-graph__link-muted) {
      opacity: 0.18 !important;
    }
    :deep(.category-graph__link-zero) {
      visibility: hidden;
    }
  }

  &__mobile {
    display: none;
  }
  &__details {
    margin-inline: 24px;
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
    padding: 10px 0;
  }
  &__path {
    display: flex;
    gap: 8px;
    align-items: center;
    min-height: 24px;
    font-size: 12px;
    line-height: 20px;
    color: var(--sd-modern-muted);
    overflow-wrap: anywhere;
    > .v-icon {
      flex-shrink: 0;
    }
    > .v-btn {
      margin-inline-start: auto;
      flex-shrink: 0;
    }
  }
  &__description {
    margin: 8px 0 0;
    font-size: 13px;
    line-height: 21px;
    overflow-wrap: anywhere;
  }
  &__counts {
    display: flex;
    gap: 8px 20px;
    flex-wrap: wrap;
    margin-top: 8px;
    font-size: 12px;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  &__footer {
    display: flex;
    justify-content: space-between;
    gap: 8px 16px;
    flex-wrap: wrap;
    padding: 12px 24px;
    background: rgba(var(--v-theme-on-surface), 0.025);
    font-size: 11px;
    line-height: 18px;
  }
  &__drag-hint {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  @media (max-width: 650px) {
    &__toolbar {
      padding: 18px 16px;
      gap: 14px;
    }
    &__desktop {
      display: none;
    }
    &__mobile {
      display: block;
      padding: 0 16px 16px;
      > p {
        margin: 0 0 8px;
        padding-top: 12px;
        border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
        font-size: 12px;
        line-height: 20px;
      }
    }
    &__details {
      margin-inline: 16px;
    }
    &__footer {
      padding: 12px 16px;
    }
    &__drag-hint {
      display: none;
    }
  }
  @media (max-width: 650px), (pointer: coarse) {
    &__modes :deep(.v-btn) {
      min-height: 44px;
    }
  }
}
</style>
