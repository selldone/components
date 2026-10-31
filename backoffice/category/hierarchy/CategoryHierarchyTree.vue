<template>
  <ul class="category-hierarchy-tree">
    <li
      v-for="node in nodes"
      :key="node.key"
      :class="{
        'category-hierarchy-tree__node--editable':
          canEdit && node.category.id != null,
      }"
    >
      <details v-if="node.children.length" open>
        <summary @click="$emit('select', node.key)">
          <span class="category-hierarchy-tree__identity">
            <v-avatar
              class="category-hierarchy-tree__avatar"
              size="20"
              rounded="sm"
              aria-hidden="true"
            >
              <v-icon size="18">folder</v-icon>
              <img
                v-if="node.category.icon"
                :src="getShopImagePath(node.category.icon, 64)"
                width="20"
                height="20"
                alt=""
                loading="lazy"
                decoding="async"
                @error="hideBrokenAvatar"
              />
            </v-avatar>
            <span>{{ node.title }}</span>
          </span>
          <small v-if="mode !== 'mono'">{{
            $n(metric(node.category, mode))
          }}</small>
        </summary>
        <category-hierarchy-tree
          :nodes="node.children"
          :mode="mode"
          :selected="selected"
          :can-edit="canEdit"
          @select="$emit('select', $event)"
          @edit="$emit('edit', $event)"
        />
      </details>
      <button
        v-else
        type="button"
        :aria-pressed="selected === node.key"
        class="sd-modern-clickable-item category-hierarchy-tree__select"
        @click="$emit('select', node.key)"
      >
        <span class="category-hierarchy-tree__identity">
          <v-avatar
            class="category-hierarchy-tree__avatar"
            size="20"
            rounded="sm"
            aria-hidden="true"
          >
            <v-icon size="18">folder</v-icon>
            <img
              v-if="node.category.icon"
              :src="getShopImagePath(node.category.icon, 64)"
              width="20"
              height="20"
              alt=""
              loading="lazy"
              decoding="async"
              @error="hideBrokenAvatar"
            />
          </v-avatar>
          <span>{{ node.title }}</span>
        </span>
        <small v-if="mode !== 'mono'">{{
          $n(metric(node.category, mode))
        }}</small>
      </button>
      <v-tooltip
        v-if="canEdit && node.category.id != null"
        :text="`${$t('global.actions.edit')} · ${node.title}`"
        content-class="sd-modern-tooltip text-start"
        location="top"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="sd-modern-icon-button category-hierarchy-tree__edit"
            variant="text"
            icon="settings"
            :aria-label="`${$t('global.actions.edit')} · ${node.title}`"
            @click.stop="$emit('edit', node.category)"
          />
        </template>
      </v-tooltip>
    </li>
  </ul>
</template>

<script lang="ts">
import { categoryMetric } from "./category-hierarchy";

export default {
  name: "CategoryHierarchyTree",
  props: {
    nodes: { type: Array, required: true },
    mode: { type: String, required: true },
    selected: String,
    canEdit: Boolean,
  },
  emits: ["select", "edit"],
  methods: {
    metric: categoryMetric,
    hideBrokenAvatar(event: Event) {
      (event.target as HTMLImageElement).hidden = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.category-hierarchy-tree {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    position: relative;
  }

  &__node--editable > details > summary,
  &__node--editable > .category-hierarchy-tree__select {
    min-height: 52px;
    padding-inline-end: 56px;
  }

  &__edit {
    position: absolute;
    inset-block-start: 4px;
    inset-inline-end: 0;
  }

  .category-hierarchy-tree {
    padding-inline-start: 14px;
    border-inline-start: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  }

  summary,
  &__select {
    box-sizing: border-box;
    width: 100%;
    min-height: 44px;
    padding: 10px 12px;
    color: inherit;
    font: inherit;
    font-size: 13px;
    line-height: 20px;
    text-align: start;
    overflow-wrap: anywhere;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: -2px;
      border-radius: 6px;
    }
  }

  summary {
    font-weight: 500;
  }

  &__identity {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    vertical-align: middle;
  }

  &__avatar {
    flex-shrink: 0;
    color: var(--sd-modern-muted);

    img {
      position: absolute;
      inset: 0;
      object-fit: cover;
      border-radius: 4px;
    }
  }

  &__select {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);

    &[aria-pressed="true"] {
      color: rgb(var(--v-theme-primary));
    }
  }

  small {
    margin-inline-start: 8px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
}
</style>
