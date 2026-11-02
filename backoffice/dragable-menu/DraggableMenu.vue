<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template>
  <div
    ref="menuRoot"
    v-bind="$attrs"
    class="rounded-lg overflow-hidden"
    :class="{ 's--draggable-menu--modern': modern }"
    style="border: solid thin #ddd"
  >
    <v-sheet v-if="hasDelete" class="text-end pa-1" color="#ddd">
      <v-btn
        class="ma-1"
        color="#000"
        size="x-small"
        variant="plain"
        @click="$emit('click:delete')"
      >
        <v-icon start>delete</v-icon>
        {{ $t("global.actions.delete") }}
      </v-btn>
    </v-sheet>
    <draggable
      :class="{ '-flat': flat }"
      :model-value="list"
      :item-key="getItemKey"
      class="list-group list-group-flush py-0 mt-2"
      style="list-style-type: none"
      tag="div"
      v-bind="dragOptions"
      @end="drag = false"
      @start="drag = true"
      @update:model-value="(val) => $emit('update:modelValue', val)"
    >
      <template v-slot:item="{ element, index }">
        <li :key="index" class="list-group-item d-flex align-center">
          <v-tooltip
            v-if="modern"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
          >
            <template #activator="{ props }">
              <button
                v-bind="props"
                type="button"
                class="s--draggable-menu__handle"
                :aria-label="
                  $t('admin_shop.edit.edit_menu.modern.reorder_link', {
                    name: element.name,
                  })
                "
                @keydown="onHandleKeydown($event, index)"
              >
                <v-icon size="17" aria-hidden="true">drag_indicator</v-icon>
              </button>
            </template>
            {{ $t("admin_shop.edit.edit_menu.modern.reorder_link_help") }}
          </v-tooltip>
          <v-tooltip
            v-if="element.to"
            :color="modern ? undefined : 'black'"
            :location="modern ? 'top' : 'bottom'"
            :content-class="
              modern ? 'sd-modern-tooltip text-start' : 'text-start bg-black'
            "
            :open-on-focus="modern ? true : undefined"
          >
            <template v-slot:activator="{ props }">
              <v-avatar
                v-if="element.image"
                :image="getShopImagePath(element.image, 128)"
                size="20"
                class="float-right ma-2"
                :class="{ 's--draggable-menu__type': modern }"
                :tabindex="modern ? 0 : undefined"
                v-bind="props"
              ></v-avatar>
              <v-icon
                v-else
                class="float-right ma-2"
                :class="{ 's--draggable-menu__type': modern }"
                :tabindex="modern ? 0 : undefined"
                size="small"
                v-bind="props"
                >info_outline
              </v-icon>
            </template>
            <b class="mb-1">{{ element.to.name }}</b>
            <div
              v-if="element.to.params && element.to.params.page_name"
              class="small"
            >
              <b>Page:</b> {{ element.to.params.page_name }}
            </div>
          </v-tooltip>

          <v-tooltip
            v-if="element.href"
            :color="modern ? undefined : 'black'"
            :location="modern ? 'top' : 'bottom'"
            :content-class="
              modern ? 'sd-modern-tooltip text-start' : 'text-start bg-black'
            "
            :open-on-focus="modern ? true : undefined"
          >
            <template v-slot:activator="{ props }">
              <v-icon
                v-if="modern"
                v-bind="props"
                class="s--draggable-menu__type"
                size="16"
                tabindex="0"
                :aria-label="element.href"
                >link</v-icon
              >
              <v-icon
                v-else
                class="float-right m-2"
                size="small"
                v-bind="props"
                @click="showEditLink(element)"
                >link
              </v-icon>
            </template>
            <template v-if="modern">
              <b>{{ element.name }}</b>
              <div class="small">{{ element.href }}</div>
              <div v-if="element.target" class="small">
                {{ element.target }}
              </div>
            </template>
            <template v-else>
              <b class="mb-1">External Link | {{ element.name }}</b>
              <div class="small">{{ element.href }}</div>
              <div v-if="element.target" class="small">
                <b>Target:</b> {{ element.target }}
              </div>
              <br />
              <i>Click to edit more...</i>
            </template>
          </v-tooltip>

          <span
            class="editable-span"
            contenteditable="true"
            :role="modern ? 'textbox' : undefined"
            :aria-label="
              modern
                ? $t('global.commons.label') + ' ' + element.name
                : undefined
            "
            :aria-multiline="modern ? 'false' : undefined"
            @blur="(e) => (element.name = e.target.innerText)"
            v-text="element.name"
          ></span>

          <v-tooltip
            v-if="modern"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="sd-modern-icon-button s--draggable-menu__edit"
                icon
                variant="text"
                :aria-label="
                  (element.href
                    ? $t('global.commons.edit')
                    : $t('admin_shop.edit.edit_menu.modern.edit_link_label')) +
                  ' ' +
                  element.name
                "
                @click.stop="
                  element.href ? showEditLink(element) : editLabel(index)
                "
              >
                <v-icon size="16" aria-hidden="true">edit</v-icon>
              </v-btn>
            </template>
            {{
              element.href
                ? $t("global.commons.edit")
                : $t("admin_shop.edit.edit_menu.modern.edit_link_label")
            }}
          </v-tooltip>

          <v-btn
            icon
            :class="modern ? 'sd-modern-icon-button' : undefined"
            :title="modern ? undefined : 'Delete item'"
            :aria-label="
              modern
                ? $t('global.actions.delete') + ' ' + element.name
                : undefined
            "
            variant="text"
            @click="deleteItem(index)"
            @click.stop
          >
            <v-icon :color="modern ? undefined : 'red'">{{
              modern ? "delete_outline" : "close"
            }}</v-icon>
            <v-tooltip
              v-if="modern"
              activator="parent"
              location="top"
              open-on-focus
              content-class="sd-modern-tooltip text-start"
              >{{ $t("global.actions.delete") }}</v-tooltip
            >
          </v-btn>
        </li>
      </template>

      <template v-slot:footer>
        <div :class="modern ? 's--draggable-menu__footer' : 'py-2'">
          <v-btn
            v-if="hasAdd"
            :class="
              modern ? 'sd-modern-button sd-modern-button--inline' : undefined
            "
            :min-height="modern ? undefined : '36px'"
            width="100%"
            @click="$emit('add-click')"
            :color="modern ? 'primary' : '#000'"
            variant="plain"
          >
            <v-icon start>{{ modern ? "add" : "add_box" }}</v-icon>
            {{
              $t(
                modern
                  ? "admin_shop.edit.edit_menu.modern.add_link"
                  : "global.actions.add",
              )
            }}
          </v-btn>
        </div>
      </template>
    </draggable>
  </div>

  <!-- Edit Link -->

  <v-bottom-sheet
    v-model="link_dialog"
    content-class="rounded-t-xl"
    max-width="720"
    width="98vw"
  >
    <v-card
      v-if="selected_item"
      class="text-start"
      :class="
        modern
          ? 'sd-modern-widget s--draggable-menu__sheet rounded-b-0'
          : undefined
      "
      rounded="t-xl"
    >
      <v-card-title :class="modern ? 'sd-modern-title-text' : undefined">
        <v-icon class="me-1">link</v-icon>
        {{ $t("global.commons.edit") }} | {{ selected_item.name }}
      </v-card-title>
      <v-card-text>
        <div :class="modern ? 'sd-modern-form' : 'widget-box mb-5'">
          <v-text-field
            v-model="selected_item.name"
            :class="modern ? 'sd-modern-underlined-field' : undefined"
            :label="$t('global.commons.label')"
            variant="underlined"
          >
          </v-text-field>

          <v-text-field
            v-model="selected_item.href"
            :class="modern ? 'sd-modern-underlined-field' : undefined"
            :label="$t('global.commons.link')"
            variant="underlined"
          >
          </v-text-field>

          <u-smart-select
            v-model="selected_item.target"
            :items="[
              {
                value: '_blank',
                text: modern
                  ? 'admin_shop.edit.edit_menu.modern.link_new_page'
                  : 'Open In New Page',
                icon: 'open_in_new',
              },
            ]"
            item-value="value"
            item-text="text"
            item-icon="icon"
            force-show-all
            :color="modern ? 'primary' : '#000'"
            :class="modern ? 'sd-modern-smart-select' : undefined"
            :accessible="modern"
            clearable
          >
          </u-smart-select>
        </div>
      </v-card-text>
      <v-card-actions :class="modern ? 'sd-modern-form-actions' : undefined">
        <div class="widget-buttons">
          <v-btn
            :class="modern ? 'sd-modern-button' : undefined"
            :size="modern ? undefined : 'x-large'"
            variant="text"
            @click="link_dialog = false"
            prepend-icon="check"
          >
            {{ $t("global.actions.done") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { defineAsyncComponent, markRaw } from "vue";
import USmartSelect from "@selldone/components-vue/ui/smart/select/USmartSelect.vue";

export default {
  name: "DraggableMenu",
  components: {
    USmartSelect,
    draggable: defineAsyncComponent(() => import("vuedraggable")),
  },
  emits: ["update:modelValue", "add-click", "click:delete"],
  props: {
    modelValue: {},
    modern: {
      default: false,
      type: Boolean,
    },
    hasAdd: {
      default: true,
      type: Boolean,
    },
    hasDelete: {
      default: false,
      type: Boolean,
    },
    flat: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    drag: false,
    index: 0,
    list: [],
    link_dialog: false,
    selected_item: null,
    item_identity: markRaw({ keys: new WeakMap(), next: 0 }),
  }),

  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
        ...(this.modern ? { handle: ".s--draggable-menu__handle" } : {}),
      };
    },
  },

  watch: {
    modelValue() {
      this.list = this.modelValue;
    },
  },

  created() {
    this.list = this.modelValue;
  },
  methods: {
    getItemKey(item) {
      // Names and destinations can change; identity keys never enter the menu model.
      const identity = this.item_identity;
      if (!identity.keys.has(item)) identity.keys.set(item, identity.next++);
      return identity.keys.get(item);
    },

    onHandleKeydown(event, index) {
      if (
        !this.modern ||
        !event.altKey ||
        !["ArrowUp", "ArrowDown"].includes(event.key)
      )
        return;
      event.preventDefault();
      const destination = index + (event.key === "ArrowUp" ? -1 : 1);
      if (destination < 0 || destination >= this.list.length) return;
      const [item] = this.list.splice(index, 1);
      this.list.splice(destination, 0, item);
      this.$emit("update:modelValue", this.list);
      this.$nextTick(() => {
        this.$refs.menuRoot
          .querySelectorAll(".s--draggable-menu__handle")
          [destination]?.focus();
      });
    },

    editLabel(index) {
      const label =
        this.$refs.menuRoot.querySelectorAll(".editable-span")[index];
      if (!label) return;
      label.focus();
      const range = label.ownerDocument.createRange();
      range.selectNodeContents(label);
      const selection = label.ownerDocument.defaultView?.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    },

    deleteItem(index) {
      this.list.splice(index, 1);
      this.$emit("update:modelValue", this.list);
    },

    showEditLink(item) {
      this.selected_item = item;
      this.link_dialog = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.s--draggable-menu__sheet {
  :deep(.sd-modern-smart-select b),
  :deep(.sd-modern-smart-select .small) {
    color: rgb(var(--v-theme-on-surface));
  }
}
.s--draggable-menu--modern {
  .list-group-item {
    cursor: default;
  }
  .s--draggable-menu__handle {
    display: inline-grid;
    place-items: center;
    flex: 0 0 32px;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    border-radius: 8px;
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.66));
    background: transparent;
    cursor: grab;
    touch-action: none;
    &:active {
      cursor: grabbing;
    }
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
  }
  .s--draggable-menu__type {
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.66));
  }
  .s--draggable-menu__footer {
    margin-block-start: 6px;
    padding-block: 0;
    > .v-btn {
      width: 100%;
      min-height: 34px;
      padding: 6px 8px;
      border-radius: 7px;
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
    }
  }
  @media (max-width: 600px), (pointer: coarse) {
    .s--draggable-menu__handle {
      flex-basis: 44px;
      width: 44px;
      height: 44px;
    }
    .s--draggable-menu__footer > .v-btn {
      min-height: 44px;
    }
  }
}
.list-group {
  min-height: 32px;
  background-color: #fafafa;
  border-radius: 16px;
  padding: 18px 8px;

  &.-flat {
    background-color: unset;

    .list-group-item {
      border: none !important;
      border-radius: 8px;
      margin-bottom: 4px;
    }
  }
}

.list-group-item {
  text-align: center;
  cursor: move;
  padding: 4px;
  position: relative;
  list-style: none;

  .delete-button {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translate(0, -50%);
    margin: 0;
  }
}

.editable-span {
  cursor: text;
  display: inline-block;
  flex-grow: 1;
  min-height: 29px;
  min-width: 80px;
  padding: 4px 8px;

  &:hover {
    background: #00a89a;
    color: white;
  }
}
</style>
