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
  <div
    class="s--form-builder"
    :class="modern ? 's-form-builder--modern' : 'widget-box'"
    :data-focused="focusedMode || undefined"
    @keydown.esc="focusedMode && showAddPicker && closeAddPicker()"
  >
    <div v-if="modern" class="s-form-builder__toolbar">
      <div>
        <h3>{{ focusedMode ? $t('shop_configuration.flow_modern.form.focused.fields') : title }}<span v-if="focusedMode" class="s-form-builder__count">{{ structure?.length || 0 }}</span></h3>
        <p>{{ $t(focusedMode ? 'shop_configuration.flow_modern.form.focused.order_hint' : 'shop_configuration.flow_modern.form.field_order') }}</p>
      </div>
      <div class="s-form-builder__add">
        <v-btn v-if="focusedMode" ref="addFieldButton" class="sd-modern-button s-form-builder__add-focused" variant="text" prepend-icon="add" :disabled="readOnly" :aria-expanded="showAddPicker" @click="showAddPicker = !showAddPicker">{{ $t('shop_configuration.flow_modern.form.focused.add') }}</v-btn>
        <template v-else>
        <v-select
          v-model="new_field_type"
          :items="item_types"
          item-title="title"
          item-value="value"
          :placeholder="item_types[0]?.title"
          persistent-placeholder
          :aria-label="$t('shop_configuration.flow_modern.form.new_field_type')"
          :disabled="readOnly"
          variant="underlined"
          hide-details
        />
        <v-btn
          class="sd-modern-button"
          variant="outlined"
          prepend-icon="add"
          :disabled="readOnly"
          @click="addField(new_field_type)"
          >{{ $t("global.form_builder.add_item_action") }}</v-btn
        >
        </template>
      </div>
    </div>
    <div v-if="focusedMode && showAddPicker" class="s-form-builder__type-picker">
      <button v-for="itemType in item_types" :key="itemType.value || 'text'" type="button" class="s-form-builder__type-option" :disabled="readOnly" @click="addField(itemType.value)">
        <v-icon :icon="itemType.icon" size="18" aria-hidden="true" />
        <span><strong>{{ itemType.title }}</strong><small>{{ $t('shop_configuration.flow_modern.form.focused.types.' + (itemType.value || 'text')) }}</small></span>
      </button>
    </div>
    <u-widget-header
      v-if="!modern && title"
      :icon="icon"
      :title="title"
    ></u-widget-header>
    <v-list-subheader v-if="hint && !modern">{{ hint }}</v-list-subheader>
    <div v-if="modern && !structure?.length" class="s-form-builder__empty">
      <v-icon icon="playlist_add" size="25" /><strong>{{
        $t(focusedMode ? "shop_configuration.flow_modern.form.focused.empty_title" : "shop_configuration.flow_modern.form.empty_title")
      }}</strong>
      <p>{{ $t(focusedMode ? "shop_configuration.flow_modern.form.focused.empty_hint" : "shop_configuration.flow_modern.form.empty_subtitle") }}</p>
      <v-btn v-if="focusedMode" class="sd-modern-button" variant="outlined" prepend-icon="add" :disabled="readOnly" @click="showAddPicker = true">{{ $t('shop_configuration.flow_modern.form.focused.first_field') }}</v-btn>
    </div>
    <draggable
      :animation="200"
      :disabled="readOnly"
      :model-value="structure"
      :item-key="focusedMode ? fieldKey : undefined"
      ghostClass="ghost"
      handle=".drag--handle"
      style="list-style-type: none"
      tag="div"
      @end="drag = false"
      @start="drag = true"
      @update:model-value="(val) => $emit('update:structure', val)"
    >
      <template v-slot:item="{ element, index }">
        <s-form-builder-row
          :key="focusedMode ? fieldKey(element) : index"
          :collapse="drag"
          :item="element"
          :item-types="item_types"
          :class="modern ? 's-form-builder__row' : 'mt-5'"
          :modern="modern"
          :focused="focusedMode"
          :selected="activeItem === element"
          :position="index + 1"
          :total="structure.length"
          :read-only="readOnly"
          :first="index === 0"
          :last="index === structure.length - 1"
          @remove="removeField(index)"
          @move="(direction) => moveField(index, direction)"
          @select="activeItem = activeItem === element ? null : element"
          @change="$emit('update:structure', structure)"
          :hasRequired="hasRequired"
        >
        </s-form-builder-row>
      </template>
    </draggable>

    <div v-if="!modern" class="text-end m-3">
      <v-menu :min-width="120">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="elevated" :disabled="readOnly">
            <v-icon start>add</v-icon>
            {{ $t("global.form_builder.add_item_action") }}
          </v-btn>
        </template>
        <v-list class="text-start">
          <v-list-item
            v-for="(item_type, index) in item_types"
            :key="index"
            :prepend-icon="item_type.icon"
            :title="item_type.title"
            @click="addField(item_type.value)"
          >
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <slot></slot>
  </div>
</template>

<script lang="ts">
import SFormBuilderRow from "../../ui/form/item/SFormBuilderRow.vue";
import { defineAsyncComponent, markRaw, toRaw } from "vue";

export default {
  name: "SFormBuilder",
  components: {
    draggable: defineAsyncComponent(() => import("vuedraggable")),
    SFormBuilderRow,
  },
  emits: ["update:structure"],
  props: {
    modern: { type: Boolean, default: false },
    focused: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    structure: {
      required: false,
      type: Array,
    },
    title: {
      required: false,
      type: String,
    },
    hasFile: {
      default: false,
      type: Boolean,
    },
    icon: {},
    hint: {},
    hasRequired: {
      default: false,
      type: Boolean,
    },
    hasKeyValue: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    show_hints: [],
    edit_name: null,
    drag: false,
    new_field_type: null,
    activeItem: null,
    showAddPicker: false,
    fieldKeys: markRaw(new WeakMap()),
  }),

  computed: {
    focusedMode() {
      return this.modern && this.focused;
    },
    item_types() {
      return [
        {
          title: this.$t(this.focusedMode ? "shop_configuration.flow_modern.form.focused.type_titles.text" : "global.form_builder.types.simple"),
          value: null,
          icon: this.focusedMode ? "text_fields" : "fa:fas fa-paragraph",
        },
        {
          title: this.$t(this.focusedMode ? "shop_configuration.flow_modern.form.focused.type_titles.select" : "global.form_builder.types.selective"),
          value: "select",
          icon: this.focusedMode ? "format_list_bulleted" : "fa:fas fa-list-ul",
        },
        {
          title: this.$t(this.focusedMode ? "shop_configuration.flow_modern.form.focused.type_titles.switch" : "global.form_builder.types.switch"),
          value: "switch",
          icon: this.focusedMode ? "toggle_on" : "fa:fas fa-toggle-on",
        },
        ...(this.hasFile
          ? [
              {
                title: this.$t("global.form_builder.types.file"),
                value: "file",
                icon: this.focusedMode ? "attach_file" : "fa:fas fa-file",
              },
            ]
          : []),
        ...(this.hasKeyValue
          ? [
              {
                title: this.$t("global.form_builder.types.key_value"),
                value: "key_value",
                icon: this.focusedMode ? "key" : "fa:fas fa-key",
              },
            ]
          : []),

        {
          title: this.$t(this.focusedMode ? "shop_configuration.flow_modern.form.focused.type_titles.note" : "global.commons.note"),
          value: "note",
          icon: this.focusedMode ? "sticky_note_2" : "fa:fas fa-sticky-note",
        },
      ];
    },
  },
  watch: {
    showAddPicker(value) {
      if (value && this.focusedMode) this.$nextTick(() => this.$el.querySelector('.s-form-builder__type-option')?.focus());
    },
    structure(value, previous) {
      if (this.focusedMode && ((this.activeItem && !value?.includes(this.activeItem)) || (!previous?.length && value?.length))) this.activeItem = value?.[0] || null;
    },
    focusedMode(value) {
      if (value && !this.structure?.includes(this.activeItem)) this.activeItem = this.structure?.[0] || null;
    },
  },
  created() {
    if (!this.structure || !Array.isArray(this.structure))
      this.$emit("update:structure", []);
    if (this.focusedMode) this.activeItem = this.structure?.[0] || null;
  },
  methods: {
    closeAddPicker() {
      this.showAddPicker = false;
      this.$nextTick(() => this.$refs.addFieldButton?.$el?.focus());
    },
    fieldKey(item) {
      // Runtime identity survives reordering without adding identifiers to saved form data.
      const field = toRaw(item);
      if (!this.fieldKeys.has(field)) this.fieldKeys.set(field, Symbol());
      return this.fieldKeys.get(field);
    },
    addField(type) {
      if (this.readOnly) return;
      //console.log('addField',type)
      const field = { name: "", title: "", type: type };
      this.structure.push(field);
      if (this.focusedMode) {
        this.activeItem = field;
        this.showAddPicker = false;
        this.$nextTick(() => this.$el.querySelector('.s-form-builder-row--focused.is-selected input, .s-form-builder-row--focused.is-selected textarea')?.focus());
      }
      this.$emit("update:structure", this.structure.slice());
      this.$forceUpdate(); // Force refresh component!
    },

    removeField(index) {
      if (this.readOnly) return;
      if (this.focusedMode && this.activeItem === this.structure[index]) this.activeItem = this.structure[index + 1] || this.structure[index - 1] || null;
      this.structure.splice(index, 1);
      this.$emit("update:structure", this.structure.slice());
      this.$forceUpdate(); // Force refresh component!
      if (this.focusedMode) this.$nextTick(() => {
        const target = this.$el.querySelector('.s-form-builder-row--focused.is-selected .s-form-builder-row__summary') || this.$refs.addFieldButton?.$el;
        target?.focus();
      });
    },
    moveField(index, direction) {
      if (this.readOnly) return;
      const destination = index + direction;
      if (destination < 0 || destination >= this.structure.length) return;
      const [field] = this.structure.splice(index, 1);
      this.structure.splice(destination, 0, field);
      this.$emit("update:structure", this.structure.slice());
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--form-builder {
}
.s-form-builder--modern {
  padding: 0;
  background: transparent;
  .s-form-builder__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-block-start: 20px;
    padding-block: 20px 16px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .s-form-builder__toolbar h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
  }
  .s-form-builder__toolbar p,
  .s-form-builder__empty p {
    margin: 3px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 1.5;
  }
  .s-form-builder__add {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .s-form-builder__add > .v-input {
    width: 130px;
    flex: 0 0 130px;
  }
  .s-form-builder__add :deep(.v-field__input) {
    min-height: 36px;
    padding-block: 6px;
    font-size: 13px;
    line-height: 24px;
  }
  .s-form-builder__add .sd-modern-button {
    min-height: 40px;
    padding: 0 12px;
    font-size: 13px;
  }
  .s-form-builder__empty {
    padding: 36px 8px;
    color: var(--sd-modern-muted);
    text-align: center;
  }
  .s-form-builder__empty strong {
    display: block;
    margin-block-start: 8px;
    color: rgb(var(--v-theme-on-surface));
    font-size: 14px;
    font-weight: 500;
  }
  .s-form-builder__row + .s-form-builder__row {
    margin-block-start: 16px;
  }
}
.s-form-builder--modern[data-focused] {
  .s-form-builder__toolbar { margin-block-start: 0; padding-block: 0 16px; border: 0; }
  .s-form-builder__toolbar h3 { display: flex; align-items: center; gap: 8px; }
  .s-form-builder__count { color: var(--sd-modern-muted); font-size: 12px; font-weight: 400; }
  .s-form-builder__toolbar p { margin-block-start: 4px; font-size: 11px; }
  .s-form-builder__add-focused { min-height: 38px; padding-inline: 8px; color: rgb(var(--v-theme-primary)); font-size: 12px; }
  .s-form-builder__type-picker { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; padding: 12px; margin-block-end: 14px; border: 1px solid var(--sd-modern-border); border-radius: 12px; background: var(--sd-modern-inset); }
  .s-form-builder__type-option { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 12px; border: 1px solid var(--sd-modern-border); border-radius: 9px; background: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface)); font-family: inherit; text-align: start; }
  .s-form-builder__type-option:hover { border-color: rgb(var(--v-theme-primary)); }
  .s-form-builder__type-option:disabled { opacity: .5; }
  .s-form-builder__type-option > .v-icon { flex: 0 0 18px; color: var(--sd-modern-muted); }
  .s-form-builder__type-option strong { display: block; font-size: 12px; font-weight: 500; line-height: 1.5; }
  .s-form-builder__type-option small { display: block; margin-block-start: 2px; color: var(--sd-modern-muted); font-size: 11px; line-height: 1.5; }
  .s-form-builder__row + .s-form-builder__row { margin-block-start: 10px; }
  .s-form-builder__empty { padding: 36px 8px; }
  .s-form-builder__empty .sd-modern-button { margin-block-start: 14px; font-size: 12px; }
}
@media (max-width: 480px) {
  .s-form-builder--modern[data-focused] {
    .s-form-builder__toolbar { align-items: flex-start; gap: 7px; }
    .s-form-builder__toolbar p { max-width: 150px; }
    .s-form-builder__add { width: auto; }
    .s-form-builder__type-picker { grid-template-columns: minmax(0, 1fr); }
  }
}
@media (max-width: 600px) {
  .s-form-builder--modern {
    .s-form-builder__add {
      width: 100%;
      flex-wrap: wrap;
    }
    .s-form-builder__add > .v-input {
      width: auto;
      flex: 1 1 100px;
      min-width: 0;
    }
    .s-form-builder__add .sd-modern-button {
      min-height: 44px;
    }
  }
}
@media (pointer: coarse) {
  .s-form-builder--modern .s-form-builder__add .sd-modern-button {
    min-height: 44px;
  }
}
</style>
