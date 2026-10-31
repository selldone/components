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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div v-if="modern" class="b-product-spec-row--modern text-start" :class="{ 'b-product-spec-row--heading': isGroup, 'b-product-spec-row--collapsed': isGroup && local_collapse, 'b-product-spec-row--last': groupEnd, 'b-product-spec-row--editing': editing, 'b-product-spec-row--readonly': !canEdit }">
    <template v-if="isGroup">
      <div class="b-product-spec-row__heading">
        <button v-if="canEdit" type="button" class="u-product-spec-table__handle b-product-spec-row__handle" :aria-label="$t('add_product.spec_modern.drag_heading') + ' · ' + item.group" @click="$emit('arrange')">
          <b-product-edit-info-icon name="GripVertical" :size="16" />
          <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('add_product.spec_modern.drag_heading') }}</v-tooltip>
        </button>
        <button type="button" class="b-product-spec-row__disclosure" :aria-expanded="!local_collapse" @click="toggleCollapse">
          <b-product-edit-info-icon name="FolderTree" :size="18" />
          <span class="b-product-spec-row__heading-copy"><span class="b-product-spec-row__title">{{ item.group }}</span><span v-if="local_collapse && groupDigest" class="b-product-spec-row__digest">{{ groupDigest }}</span></span>
          <span class="b-product-spec-row__count"><span class="b-product-spec-row__count-full">{{ $t('add_product.spec_modern.specifications_count', { count: groupItems.length }) }}</span><span class="b-product-spec-row__count-short" aria-hidden="true">{{ groupItems.length }}</span></span>
          <b-product-edit-info-icon name="ChevronDown" :size="16" class="b-product-spec-row__chevron" :class="{ 'b-product-spec-row__chevron--open': !local_collapse }" />
        </button>
        <v-menu v-if="canEdit" v-model="menu" location="bottom end">
          <template #activator="{ props }"><v-btn v-bind="props" class="b-product-spec-row__action sd-modern-icon-button" icon variant="outlined" :aria-label="$t('add_product.spec_modern.heading_actions') + ' · ' + item.group"><b-product-edit-info-icon name="Ellipsis" :size="16" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('add_product.spec_modern.heading_actions') }}</v-tooltip></v-btn></template>
          <v-list class="b-product-spec-row__menu text-start" density="compact">
            <v-list-item @click="startEdit"><template #prepend><b-product-edit-info-icon name="Pencil" :size="16" /></template><v-list-item-title>{{ $t('add_product.spec_modern.rename_heading') }}</v-list-item-title></v-list-item>
            <v-list-item @click="deleteItem"><template #prepend><b-product-edit-info-icon name="Trash2" :size="16" /></template><v-list-item-title>{{ $t('add_product.spec_modern.remove_heading') }}</v-list-item-title></v-list-item>
          </v-list>
        </v-menu>
      </div>
      <div v-if="editing && canEdit" class="b-product-spec-row__heading-editor">
        <v-text-field ref="modern_name" :model-value="item.group" :label="$t('add_product.spec_modern.heading_name')" class="sd-modern-underlined-field" variant="underlined" hide-details="auto" @update:model-value="updateName" @keydown.enter.prevent.stop="finishEdit" />
        <v-btn class="b-product-spec-row__action sd-modern-icon-button" icon variant="outlined" :aria-label="$t('global.actions.done')" @click="finishEdit"><b-product-edit-info-icon name="Check" :size="16" /></v-btn>
      </div>
    </template>
    <template v-else-if="isItem">
      <div v-if="groupFirst" class="b-product-spec-row__captions sd-modern-list-header"><span>{{ $t('add_product.spec_modern.property') }}</span><span>{{ $t('add_product.spec_modern.values') }}</span></div>
      <div class="b-product-spec-row__grid">
        <button v-if="canEdit" type="button" class="u-product-spec-table__handle b-product-spec-row__handle" :aria-label="$t('add_product.spec_modern.drag_specification') + ' · ' + item[0]" @click="$emit('arrange')"><b-product-edit-info-icon name="GripVertical" :size="16" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('add_product.spec_modern.drag_specification') }}</v-tooltip></button>
        <v-text-field v-if="editing && canEdit" ref="modern_name" :model-value="item[0]" :label="$t('add_product.spec_modern.specification_name')" class="b-product-spec-row__name sd-modern-underlined-field" variant="underlined" hide-details="auto" @update:model-value="updateName" @keydown.enter.prevent.stop="finishEdit" />
        <span v-else class="b-product-spec-row__name">{{ item[0] }}</span>
        <div v-if="editing && canEdit" class="b-product-spec-row__values-editor">
          <div v-for="i in item.length - 1" :key="i" class="b-product-spec-row__value-editor">
            <v-text-field ref="item_value" :model-value="item[i]" :aria-label="$t('add_product.spec_modern.values') + ' ' + i" :label="$t('add_product.spec_modern.values') + ' ' + i" class="sd-modern-underlined-field" variant="underlined" hide-details="auto" @update:model-value="updateValue(i, $event)" @keydown.enter.prevent.stop="addInnerItem(item, i); moveNestFocus(i)" />
            <v-btn v-if="i > 1" class="b-product-spec-row__action sd-modern-icon-button" icon variant="outlined" :aria-label="$t('add_product.spec_modern.remove_value') + ' ' + i" @click="removeInnerItem(i)"><b-product-edit-info-icon name="X" :size="16" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('add_product.spec_modern.remove_value') }}</v-tooltip></v-btn>
          </div>
          <p class="b-product-spec-row__help">{{ $t('add_product.spec_modern.value_help') }}</p>
          <v-btn class="sd-modern-button sd-modern-button--inline" variant="text" color="primary" @click="addInnerItem(item, item.length - 1); moveNestFocus(item.length - 2)"><template #prepend><b-product-edit-info-icon name="Plus" :size="16" /></template>{{ $t('add_product.spec_modern.add_value') }}</v-btn>
        </div>
        <ul v-else class="b-product-spec-row__values"><li v-for="(value, index) in item.slice(1)" :key="index">{{ value }}</li><li v-if="item.length < 2" class="b-product-spec-row__help">{{ $t('add_product.spec_modern.no_values') }}</li></ul>
        <div v-if="canEdit" class="b-product-spec-row__actions">
          <v-btn class="b-product-spec-row__action sd-modern-icon-button" icon variant="outlined" :aria-label="$t(editing ? 'global.actions.done' : 'add_product.spec_modern.edit_specification') + ' · ' + item[0]" @click="editing ? finishEdit() : startEdit()"><b-product-edit-info-icon :name="editing ? 'Check' : 'Pencil'" :size="16" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t(editing ? 'global.actions.done' : 'add_product.spec_modern.edit_specification') }}</v-tooltip></v-btn>
          <v-btn class="b-product-spec-row__action sd-modern-icon-button" icon variant="outlined" :aria-label="$t('add_product.spec_modern.remove_specification') + ' · ' + item[0]" @click="deleteItem"><b-product-edit-info-icon name="Trash2" :size="16" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('add_product.spec_modern.remove_specification') }}</v-tooltip></v-btn>
        </div>
      </div>
    </template>
  </div>
  <li
    v-else
    :class="$vuetify.locale.isRtl ? 'text-right' : 'text-left'"
    :dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'"
    style="list-style-type: none"
  >
    <!-- ████████████████████ Group Title ████████████████████ -->

    <div v-if="isGroup" :class="{ editable: editable }" class="section-group">
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Group > Label ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-text-field
        v-if="editing && !minimize"
        v-model="item.group"
        flat
        hide-details
        placeholder="Spec category title"
        type="text"
        variant="solo"
        @keypress.enter.stop="editing = false"
      />
      <p
        v-else
        :class="{ 'editable-blue': editable }"
        class="flex-grow-1 py-1"
        @click="editing = editable"
      >
        <v-icon v-if="editable" color="#333"> expand_more</v-icon>
        <v-btn
          v-else
          icon
          variant="text"
          @click="
            local_collapse = !local_collapse;
            $emit('update:collapse', local_collapse);
          "
        >
          <v-icon :class="{ 'rotate-180': local_collapse }" color="#333">
            expand_more
          </v-icon>
        </v-btn>
        {{ item.group }}
      </p>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Group > Edit ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <template v-if="editable && !minimize">
        <v-btn
          :color="editing ? 'primary' : '#444'"
          class="section-action"
          icon
          size="small"
          variant="text"
          @click="editing = !editing"
        >
          <v-icon> edit</v-icon>
        </v-btn>
        <v-btn
          class="section-action"
          color="#444"
          icon
          size="small"
          variant="text"
          @click="$emit('delete')"
        >
          <v-icon> delete</v-icon>
        </v-btn>
      </template>
    </div>

    <!-- ████████████████████ Item ████████████████████ -->

    <div v-if="isItem" :class="{ editable: editable }" class="list-item mt-1">
      <div :class="{ '-view-mode': !editable }" class="grid">
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Item > Label ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div
          v-if="editing && !minimize"
          class="section-item strong d-flex align-start"
        >
          <v-text-field
            v-model="item[0]"
            flat
            hide-details
            placeholder="Name of spec.."
            type="text"
            density="compact"
            variant="solo"
            @keypress.enter.stop="editing = false"
          />
        </div>

        <div
          v-else
          :class="{ 'editable-blue': !editing && editable }"
          class="section-item sec2 strong"
          @click="editing = editable"
        >
          {{ item[0] }}
        </div>

        <template v-if="!minimize">
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Item > Value ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div
            v-if="editing"
            class="section-item d-flex flex-column justify-start align-stretch"
            contenteditable="true"
          >
            <v-text-field
              v-for="i in item.length - 1"
              :key="i"
              v-model="item[i]"
              class="mb-1"
              flat
              density="compact"
              hide-details
              placeholder="Value of spec.."
              type="text"
              variant="solo"
              ref="item_value"
              @keypress.enter.stop="
                addInnerItem(item, i);
                moveNestFocus(i);
              "
            >
              <template v-slot:append-inner>
                <v-btn
                  v-if="i !== 1"
                  :title="`Remove item ${item}`"
                  icon
                  size="small"
                  variant="text"
                  @click.stop="
                    () => {
                      if (item.length > 2) item.splice(i, 1);
                    }
                  "
                >
                  <v-icon>close</v-icon>
                </v-btn>
              </template>
            </v-text-field>
            <div class="py-1 small">Press Enter to add new row.</div>
          </div>
          <div
            v-else
            :class="{
              'editable-blue': editable,
              '-dense-value': denseValues,
              'section-item has-splitter': !denseValues,
            }"
            class="section-item sec1"
            contenteditable="false"
            @click="editing = editable"
          >
            <div v-for="i in item.length - 1" :key="i">
              {{ item[i] }}
            </div>
          </div>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Item > Edit Actions ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <template v-if="editable">
            <!-- Edit button -->
            <v-btn
              :color="editing ? 'green' : '#444'"
              class="section-action"
              icon
              size="small"
              variant="text"
              @click="editing = !editing && editable"
            >
              <v-icon>
                {{ editing ? "check" : "edit" }}
              </v-icon>
            </v-btn>

            <!-- Delete button -->
            <v-btn
              class="section-action"
              color="red"
              icon
              size="small"
              variant="text"
              @click="$emit('delete')"
            >
              <v-icon>close</v-icon>
            </v-btn>
          </template>
        </template>
      </div>
    </div>
  </li>
</template>

<script lang="ts">
// ―――――――――――――――― A set of vue mixins to turn any list into an animated sortable list ――――――――――――――――
import BProductEditInfoIcon from "../../../backoffice/product/edit/info/BProductEditInfoIcon.vue";

export default {
  name: "BProductSpecRow",
  components: { BProductEditInfoIcon },
  emits: ["update:collapse", "delete", "change", "arrange"],
  props: {
    modern: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    groupItems: { type: Array, default: () => [] },
    groupFirst: { type: Boolean, default: false },
    groupEnd: { type: Boolean, default: false },
    item: {},
    editable: {
      type: Boolean,
      default: false,
    },

    minimize: {
      type: Boolean,
      default: false,
    },
    collapse: {
      type: Boolean,
      default: false,
    },
    denseValues: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    editing: false,
    local_collapse: false,
    menu: false,
  }),

  computed: {
    canEdit() {
      return this.editable && (!this.modern || !this.readOnly);
    },
    groupDigest() {
      const parts = this.groupItems.slice(0, 2).map((item) => {
        const values = item.slice(1, 3).join(', ');
        return `${item[0]}${values ? ': ' + values : ''}${item.length > 3 ? ' (+' + (item.length - 3) + ')' : ''}`;
      });
      if (this.groupItems.length > 2) parts.push(`+${this.groupItems.length - 2}`);
      return parts.join(' · ');
    },
    isGroup() {
      return !Array.isArray(this.item) && this.item.group !== undefined;
    },

    isItem() {
      return Array.isArray(this.item);
    },
  },

  watch: {
    collapse(val) {
      this.local_collapse = val;
    },
    readOnly(value) {
      if (value && this.modern) { this.editing = false; this.menu = false; }
    },
  },
  created() {
    this.local_collapse = this.collapse;
  },

  methods: {
    toggleCollapse() {
      this.local_collapse = !this.local_collapse;
      this.$emit('update:collapse', this.local_collapse);
    },
    startEdit() {
      if (!this.canEdit) return;
      this.menu = false;
      this.editing = true;
      this.$nextTick(() => this.$refs.modern_name?.focus());
    },
    finishEdit() {
      this.editing = false;
    },
    updateName(value) {
      if (!this.canEdit) return;
      if (this.isGroup) this.item.group = value;
      else this.item[0] = value;
      this.$emit('change');
    },
    updateValue(index, value) {
      if (!this.canEdit || !this.isItem || index < 1 || index >= this.item.length) return;
      this.item[index] = value;
      this.$emit('change');
    },
    removeInnerItem(index) {
      if (!this.canEdit || index <= 1 || index >= this.item.length || this.item.length <= 2) return;
      this.item.splice(index, 1);
      this.$emit('change');
    },
    deleteItem() {
      if (!this.canEdit) return;
      this.menu = false;
      this.$emit('delete');
    },
    addInnerItem(item, index) {
      if (this.modern && !this.canEdit) return;
      item.splice(index + 1, 0, "");
      if (this.modern) this.$emit('change');
    },
    moveNestFocus(i /*Start from 1*/) {
      this.$nextTick(() => {
        if (this.$refs.item_value?.[i]) this.$refs.item_value[i].focus();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.rtl {
  direction: rtl !important;
}

.list-item {
  position: relative;
  min-height: 42px;
  background: #fafafa;
  margin-right: 0;
  margin-left: 0;
  border-radius: 4px;

  &.editable {
    cursor: move;
    user-select: none;
  }

  width: 100%;

  .grid {
    display: grid;
    grid-template-columns: 35% auto 50px 50px;

    &.-view-mode {
      grid-template-columns: 35% auto;
    }

    @media only screen and (max-width: 900px) {
      //   display: block;
      grid-template-columns: 35% auto !important;

      // grid-template-columns:unset;
      font-size: 0.9rem;
    }
  }

  .section-item {
    // direction: rtl;
    font-weight: 500;
    //text-align: right;
    display: inline-block;
    padding: 4px 8px 4px 8px;

    cursor: text;

    word-wrap: break-word; /* For legacy browsers */
    overflow-wrap: break-word; /* Standard CSS */
    word-break: break-word; /* Modern browsers */

    &.strong {
      font-weight: 700;
    }

    @media only screen and (max-width: 900px) {
      //   display: block;
    }

    &.-dense-value {
      display: flex !important;
      flex-wrap: wrap;
      flex-direction: row;

      & > * {
        padding: 6px;
      }
    }
  }

  .section-action {
    text-align: center !important;
    margin: auto !important;
  }

  .sec1 {
    //   width: 25%;
    div {
      margin: 0;
      padding: 6px;
    }

    &.has-splitter {
      :not(:first-child) {
        padding-top: 8px;
        border-top: #fff solid 2px;
      }
    }
  }

  .sec2 {
    // width: 50%;
    display: flex;
    align-items: center;
  }
}

.section-group {
  min-height: 48px;
  margin-top: 12px;
  padding: 8px 12px;
  font-weight: 800;
  font-size: 1.4em;
  display: flex;
  align-items: center;

  &.editable {
    cursor: move;
    user-select: none;
  }

  p {
    margin: 0;
  }

  @media only screen and (max-width: 900px) {
    font-size: 1.1rem;
  }
}
</style>

<style lang="scss" scoped>
.b-product-spec-row--modern {
  --spec-border: rgba(var(--v-border-color), var(--v-border-opacity));
  box-sizing: border-box;
  min-width: 0;
  padding: 0 23px;
  border-inline: 1px solid var(--spec-border);
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  font-size: 14px;
  line-height: 21px;

  &.b-product-spec-row--heading {
    margin-top: 14px;
    border-top: 1px solid var(--spec-border);
    border-radius: 16px 16px 0 0;
  }
  &.b-product-spec-row--last {
    margin-bottom: 14px;
    border-bottom: 1px solid var(--spec-border);
    border-radius: 0 0 16px 16px;
  }
  &.b-product-spec-row--heading.b-product-spec-row--last { border-radius: 16px; }

  .b-product-spec-row__heading { display: flex; align-items: center; gap: 8px; min-width: 0; min-height: 69px; }
  .b-product-spec-row__disclosure { box-sizing: border-box; display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; min-height: 69px; padding-block: 14px; text-align: start; color: inherit; }
  .b-product-spec-row__disclosure > svg { flex-shrink: 0; }
  .b-product-spec-row__heading-copy { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
  .b-product-spec-row__title { font-size: 16px; font-weight: 500; line-height: 24px; overflow-wrap: anywhere; }
  .b-product-spec-row__digest { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 12px; font-weight: 400; line-height: 18px; opacity: .6; overflow-wrap: anywhere; }
  .b-product-spec-row__count { flex-shrink: 0; font-size: 11px; line-height: 16px; text-align: center; opacity: .65; }
  .b-product-spec-row__count-short { display: none; }
  .b-product-spec-row__chevron { flex-shrink: 0; transition: transform .15s; }
  .b-product-spec-row__chevron--open { transform: rotate(180deg); }
  .b-product-spec-row__heading-editor { display: flex; align-items: center; gap: 12px; padding-bottom: 18px; }
  .b-product-spec-row__captions { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: 12px; padding: 10px 84px 10px 44px; }
  .b-product-spec-row__grid { box-sizing: border-box; display: grid; grid-template-columns: 32px minmax(0, .8fr) minmax(0, 1.2fr) 72px; gap: 12px; align-items: center; min-width: 0; min-height: 58px; padding-block: 10px; border-bottom: 1px solid var(--spec-border); }
  &.b-product-spec-row--last .b-product-spec-row__grid { border-bottom: 0; }
  &.b-product-spec-row--editing .b-product-spec-row__grid { align-items: start; }
  &.b-product-spec-row--collapsed {
    .b-product-spec-row__heading, .b-product-spec-row__disclosure { min-height: 84px; }
    .b-product-spec-row__disclosure { padding-block: 12px; }
    .b-product-spec-row__title { font-size: 14px; line-height: 21px; }
  }
  .b-product-spec-row__name { grid-column: 2; align-self: center; min-width: 0; font-weight: 500; overflow-wrap: anywhere; }
  &.b-product-spec-row--editing .b-product-spec-row__name { align-self: start; }
  .b-product-spec-row__values, .b-product-spec-row__values-editor { grid-column: 3; min-width: 0; margin: 0; padding: 0; list-style: none; }
  .b-product-spec-row__values { display: flex; flex-wrap: wrap; }
  .b-product-spec-row__values li { min-width: 0; overflow-wrap: anywhere; }
  .b-product-spec-row__values li + li::before { content: '·'; padding-inline: 8px; opacity: .4; }
  .b-product-spec-row__actions { grid-column: 4; display: flex; gap: 8px; }
  .b-product-spec-row__action { box-sizing: border-box; width: 32px; min-width: 32px; height: 32px; padding: 0; flex: 0 0 32px; border-radius: 8px; border-color: var(--spec-border); color: inherit; }
  .b-product-spec-row__handle { box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; flex: 0 0 32px; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 7px; color: rgba(var(--v-theme-on-surface), .4); cursor: grab; touch-action: none; }
  .b-product-spec-row__handle:active { cursor: grabbing; }
  .b-product-spec-row__handle:hover { background: rgba(var(--v-theme-on-surface), .05); color: inherit; }
  button:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  .b-product-spec-row__value-editor { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .b-product-spec-row__help { margin-block: 6px; font-size: 12px; line-height: 18px; color: rgba(var(--v-theme-on-surface), .6); }
  :deep(.sd-modern-underlined-field) { min-width: 0; }
  :deep(.sd-modern-underlined-field .v-field__input) { box-sizing: border-box; min-height: 60px; font-size: 14px; line-height: 21px; padding-block: 25px 8px; }
  :deep(.sd-modern-underlined-field .v-field-label) { font-size: 12px; }
  :deep(.sd-modern-underlined-field .v-input__details) { padding-inline: 0; font-size: 12px; }

  &.b-product-spec-row--readonly {
    .b-product-spec-row__grid { grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); }
    .b-product-spec-row__name { grid-column: 1; }
    .b-product-spec-row__values { grid-column: 2; }
    .b-product-spec-row__captions { padding-inline: 0; }
  }
}
.b-product-spec-row__menu { min-width: 200px; border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 10px !important; background: rgb(var(--v-theme-surface)); }
.b-product-spec-row__menu :deep(.v-list-item__prepend) { margin-inline-end: 10px; }
.b-product-spec-row__menu :deep(.v-list-item-title) { font-size: 13px; line-height: 20px; }

@media (max-width: 680px), (pointer: coarse) {
  .b-product-spec-row--modern {
    .b-product-spec-row__action, .b-product-spec-row__handle { width: 44px; min-width: 44px; height: 44px; flex-basis: 44px; }
    .b-product-spec-row__grid { grid-template-columns: 44px minmax(0, .8fr) minmax(0, 1.2fr) 96px; gap: 8px; }
    .b-product-spec-row__captions { padding-inline: 52px 104px; gap: 8px; }
  }
}
@media (max-width: 660px) {
  .b-product-spec-row--modern {
    padding-inline: 18px;
    .b-product-spec-row__heading { gap: 4px; }
    .b-product-spec-row__disclosure { gap: 6px; }
    .b-product-spec-row__disclosure > svg:first-child { display: none; }
    .b-product-spec-row__count-full { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
    .b-product-spec-row__count-short { display: inline; }
    .b-product-spec-row__captions { display: none; }
    .b-product-spec-row__grid { grid-template-columns: 44px minmax(0, 1fr) 96px; gap: 6px; }
    .b-product-spec-row__grid > .b-product-spec-row__handle { grid-column: 1; grid-row: 1 / 3; }
    .b-product-spec-row__name { grid-column: 2; grid-row: 1; }
    .b-product-spec-row__actions { grid-column: 3; grid-row: 1; }
    .b-product-spec-row__values, .b-product-spec-row__values-editor { grid-column: 2 / 4; grid-row: 2; font-size: 13px; line-height: 20px; }
    &.b-product-spec-row--editing {
      .b-product-spec-row__name { grid-column: 2 / 4; }
      .b-product-spec-row__actions { grid-column: 2 / 4; grid-row: 3; justify-content: flex-end; }
    }
    &.b-product-spec-row--readonly {
      .b-product-spec-row__grid { grid-template-columns: minmax(0, 1fr); }
      .b-product-spec-row__name, .b-product-spec-row__values { grid-column: 1; }
    }
  }
}
@media (max-width: 380px) {
  .b-product-spec-row--modern:not(.b-product-spec-row--readonly) {
    .b-product-spec-row__name { grid-column: 2 / 4; }
    .b-product-spec-row__actions { grid-column: 2 / 4; grid-row: 3; justify-content: flex-end; }
  }
}
</style>
