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
    class="s--form-builder-container"
    :class="{ 's-form-builder-row--modern': modern, 's-form-builder-row--focused': focused, 'is-selected': focused && selected }"
  >
    <fieldset
      v-if="modern"
      :disabled="readOnly"
      class="s-form-builder-row__fieldset"
    >
      <component :is="focused ? 'legend' : 'div'" class="s-form-builder-row__header">
        <v-icon class="drag--handle cursor-move" size="16" aria-hidden="true"
          >drag_indicator</v-icon
        >
        <button
          class="s-form-builder-row__summary"
          type="button"
          :aria-expanded="isExpanded"
          @click="focused ? $emit('select') : expanded = !expanded"
        >
          <v-icon :icon="type?.icon" :size="focused ? 30 : 16" aria-hidden="true" />
          <span
            ><strong :class="{ 's-form-builder-row__note-summary': item.type === 'note' }">{{
              summaryTitle || $t("shop_configuration.flow_modern.form.untitled")
            }}</strong
            ><small
              >{{ getName(type?.title)
              }}<template v-if="item.type !== 'note' && item.required">
                · {{ $t("global.commons.required") }}</template
              ><template v-else-if="focused && item.type !== 'note'"> · {{ $t('global.commons.optional') }}</template
              ></small
            ></span
          >
          <v-icon v-if="focused" class="s-form-builder-row__chevron" :icon="isExpanded ? 'expand_less' : 'expand_more'" size="14" aria-hidden="true" />
        </button>
        <div class="s-form-builder-row__actions">
          <v-tooltip
            v-for="direction in [-1, 1]"
            v-if="!focused"
            :key="direction"
            :text="
              $t(
                direction < 0
                  ? 'shop_configuration.flow_modern.form.move_up'
                  : 'shop_configuration.flow_modern.form.move_down',
              )
            "
            content-class="sd-modern-tooltip text-start"
            location="top"
          >
            <template #activator="{ props }"
              ><v-btn
                v-bind="props"
                class="sd-modern-icon-button"
                :aria-label="
                  $t(
                    direction < 0
                      ? 'shop_configuration.flow_modern.form.move_up'
                      : 'shop_configuration.flow_modern.form.move_down',
                  )
                "
                :disabled="readOnly || (direction < 0 ? first : last)"
                :icon="direction < 0 ? 'arrow_upward' : 'arrow_downward'"
                variant="text"
                @click="$emit('move', direction)"
            /></template>
          </v-tooltip>
          <v-tooltip
            :text="$t('global.actions.delete')"
            content-class="sd-modern-tooltip text-start"
            location="top"
            ><template #activator="{ props }"
              ><v-btn
                v-bind="props"
                class="sd-modern-icon-button"
                :aria-label="$t('global.actions.delete')"
                :disabled="readOnly"
                :icon="focused ? 'delete_outline' : 'close'"
                variant="text"
                @click="removeField" /></template
          ></v-tooltip>
        </div>
      </component>
      <div v-if="isExpanded" class="s-form-builder-row__fields">
        <template v-if="item.type === 'note'">
        <v-textarea
          v-model="item.title"
          ref="titleInput"
          :disabled="readOnly"
          class="sd-modern-underlined-field"
          :label="$t('global.commons.note')"
          :messages="$t('shop_configuration.flow_modern.form.allowed_tags')"
          :placeholder="
            $t('shop_configuration.flow_modern.form.note_placeholder')
          "
          rows="4"
          variant="underlined"
        />
        <div v-if="focused" class="s-form-builder-row__note-toolbar">
          <v-tooltip v-for="format in noteFormats" :key="format.tag" :text="$t('shop_configuration.flow_modern.form.focused.' + format.label)" content-class="sd-modern-tooltip text-start" location="top">
            <template #activator="{ props }"><v-btn v-bind="props" class="sd-modern-icon-button" :aria-label="$t('shop_configuration.flow_modern.form.focused.' + format.label)" :icon="format.icon" :disabled="readOnly" variant="text" @click="formatNote(format.tag)" /></template>
          </v-tooltip>
        </div>
        </template>
        <template v-else>
          <div class="s-form-builder-row__grid s-form-builder-row__main-grid">
            <v-text-field
              v-model="item.title"
              ref="titleInput"
              :disabled="readOnly"
              class="sd-modern-underlined-field s-form-builder-row__title-input"
              :label="$t(focused ? 'shop_configuration.flow_modern.form.focused.field_label' : 'shop_configuration.flow_modern.form.public_label')"
              :messages="
                focused ? undefined : $t('shop_configuration.flow_modern.form.public_label_hint')
              "
              :hide-details="focused"
              :placeholder="
                $t('shop_configuration.flow_modern.form.label_placeholder')
              "
              persistent-placeholder
              variant="underlined"
              @blur="
                item.name = item.name ? item.name : Slugify.apply(item.title);
                $forceUpdate();
              "
            />
            <details class="s-form-builder-row__identifier" :open="focused ? undefined : true">
            <summary v-if="focused">{{ $t('shop_configuration.flow_modern.form.focused.identifier') }}</summary>
            <v-text-field
              v-model="item.name"
              class="sd-modern-underlined-field"
              :label="$t(focused ? 'shop_configuration.flow_modern.form.focused.identifier' : 'shop_configuration.flow_modern.form.field_name')"
              :messages="
                $t(focused ? 'shop_configuration.flow_modern.form.focused.identifier_hint' : 'shop_configuration.flow_modern.form.field_name_hint')
              "
              :placeholder="$t('shop_configuration.flow_modern.form.auto_name')"
              :readonly="!edit_name"
              :disabled="item.locked || readOnly"
              persistent-placeholder
              variant="underlined"
            >
              <template #append-inner
                ><v-tooltip
                  :text="
                    $t(
                      edit_name
                        ? 'shop_configuration.flow_modern.form.lock_name'
                        : 'shop_configuration.flow_modern.form.unlock_name',
                    )
                  "
                  content-class="sd-modern-tooltip text-start"
                  location="top"
                  ><template #activator="{ props }"
                    ><v-btn
                      v-bind="props"
                      class="sd-modern-input-action"
                      :aria-label="
                        $t(
                          edit_name
                            ? 'shop_configuration.flow_modern.form.lock_name'
                            : 'shop_configuration.flow_modern.form.unlock_name',
                        )
                      "
                      :icon="edit_name ? 'lock_open' : 'lock_outline'"
                      variant="text"
                      :disabled="item.locked || readOnly"
                      @click="edit_name = !edit_name" /></template></v-tooltip
              ></template>
            </v-text-field>
            </details>
          </div>
          <template v-if="item.type === 'select'">
            <v-combobox
              v-model="item.selects"
              :disabled="readOnly"
              class="sd-modern-underlined-field s-form-builder-row__choices-input"
              :items="[]"
              :label="$t('global.form_builder.value_input')"
              :messages="$t('global.form_builder.value_input_message')"
              chips
              clearable
              closable-chips
              multiple
              variant="underlined"
              ><template #chip="{ props, item }"
                ><v-chip v-bind="props">{{ item.raw }}</v-chip></template
              ></v-combobox
            >
            <u-smart-switch
              :model-value="!item.multiple"
              class="s-form-builder-row__switch"
              :accessible="modern"
              :disabled="readOnly"
              :true-title="
                $t('shop_configuration.flow_modern.form.single_item')
              "
              :true-description="
                $t('shop_configuration.flow_modern.form.single_hint')
              "
              :false-title="
                $t('shop_configuration.flow_modern.form.multiple_items')
              "
              :false-description="
                $t('shop_configuration.flow_modern.form.multiple_hint')
              "
              @update:model-value="item.multiple = !$event"
              @change="$forceUpdate()"
            />
          </template>
          <u-smart-switch
            v-if="item.type === 'switch'"
            :model-value="!item.default"
            class="s-form-builder-row__switch"
            :accessible="modern"
            :disabled="readOnly"
            :true-title="
              $t('shop_configuration.flow_modern.form.default_false')
            "
            :true-description="item.hint_false"
            :false-title="
              $t('shop_configuration.flow_modern.form.default_true')
            "
            :false-description="item.hint_true"
            true-icon="close"
            false-icon="check"
            @update:model-value="item.default = !$event"
            @change="$forceUpdate()"
          />
          <template v-if="item.type === 'file'">
            <v-combobox
              v-model="item.types"
              :disabled="readOnly"
              class="sd-modern-underlined-field"
              :items="['jpeg', 'png', 'zip', 'pdf']"
              :label="$t('global.form_builder.file_type_input')"
              :messages="$t('global.form_builder.file_type_message')"
              chips
              clearable
              closable-chips
              multiple
              variant="underlined"
            />
            <u-smart-switch
              v-model="item.multiple"
              class="s-form-builder-row__switch"
              :accessible="modern"
              :disabled="readOnly"
              false-title="Single file"
              true-title="Multiple files"
              @change="$forceUpdate()"
            />
          </template>
          <v-checkbox
            v-if="hasRequired"
            v-model="item.required"
            :disabled="readOnly"
            class="s-form-builder-row__required"
            :label="
              $t(
                item.required
                  ? 'global.commons.required'
                  : 'global.commons.optional',
              )
            "
            color="primary"
            hide-details
            density="compact"
          />
          <v-btn
            v-if="!focused"
            :disabled="readOnly"
            class="sd-modern-button sd-modern-button--small s-form-builder-row__hints"
            variant="text"
            prepend-icon="expand_more"
            :aria-expanded="show_hints"
            @click="show_hints = !show_hints"
            >{{ $t("shop_configuration.flow_modern.form.edit_hints") }}</v-btn
          >
          <div
            v-if="(focused || show_hints) && item.type === 'switch'"
            class="s-form-builder-row__grid s-form-builder-row__switch-hints"
          >
            <v-text-field
              v-model="item.hint_true"
              :disabled="readOnly"
              class="sd-modern-underlined-field"
              :label="$t('shop_configuration.flow_modern.form.hint_true')"
              :placeholder="
                $t('shop_configuration.flow_modern.form.hint_placeholder')
              "
              persistent-placeholder
              variant="underlined"
            />
            <v-text-field
              v-model="item.hint_false"
              :disabled="readOnly"
              class="sd-modern-underlined-field"
              :label="$t('shop_configuration.flow_modern.form.hint_false')"
              :placeholder="
                $t('shop_configuration.flow_modern.form.hint_placeholder')
              "
              persistent-placeholder
              variant="underlined"
            />
          </div>
          <v-text-field
            v-else-if="focused || show_hints"
            v-model="item.hint"
            :disabled="readOnly"
            class="sd-modern-underlined-field s-form-builder-row__hint-input"
            :label="$t(focused ? 'shop_configuration.flow_modern.form.focused.help_text' : 'shop_configuration.flow_modern.form.customer_hint')"
            :hide-details="focused"
            :placeholder="
              $t('shop_configuration.flow_modern.form.hint_placeholder')
            "
            persistent-placeholder
            variant="underlined"
          />
        </template>
        <div v-if="focused" class="s-form-builder-row__editor-footer">
          <span>{{ position }} / {{ total }}</span>
          <div class="s-form-builder-row__actions">
            <v-tooltip v-for="direction in [-1, 1]" :key="direction" :text="$t(direction < 0 ? 'shop_configuration.flow_modern.form.move_up' : 'shop_configuration.flow_modern.form.move_down')" content-class="sd-modern-tooltip text-start" location="top">
              <template #activator="{ props }"><v-btn v-bind="props" class="sd-modern-icon-button" :aria-label="$t(direction < 0 ? 'shop_configuration.flow_modern.form.move_up' : 'shop_configuration.flow_modern.form.move_down')" :disabled="readOnly || (direction < 0 ? first : last)" :icon="direction < 0 ? 'arrow_upward' : 'arrow_downward'" variant="text" @click="$emit('move', direction)" /></template>
            </v-tooltip>
          </div>
        </div>
      </div>
    </fieldset>
    <v-row v-if="!modern" align="center" class="py-1 flex-nowrap" no-gutters>
      <v-icon class="me-3 cursor-move drag--handle" title="Drag and move"
        >unfold_more
      </v-icon>

      <v-icon>{{ type?.icon }}</v-icon>

      <b class="mx-1 small">{{ item.title?.limitWords(8) }}</b>
      <span class="mx-1 small text-nowrap">/ {{ getName(type?.title) }}</span>

      <v-spacer></v-spacer>

      <u-button-circle
        :title="$t('global.actions.delete')"
        color="#fff"
        icon="close"
        @click="removeField()"
      />
    </v-row>

    <v-expand-transition v-if="!modern">
      <div v-if="!collapse" class="elevation-3">
        <div
          :class="{
            '-locked':
              item.locked /*Locked item - ex. variants field for virtual products*/,
          }"
          class="s--form-builder-item"
        >
          <!-- General Attributes -->
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Note ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <template v-if="item.type === 'note'">
            <v-textarea
              v-model="item.title"
              :label="$t('global.commons.note')"
              color="primary"
              messages="Allowed tags: <h1>...<h5>, <br>, <b>, <i>, <a>,<ol>,<ul>, <li>, <hr>, <img>"
              placeholder="Writer your message here..."
              variant="underlined"
            />
          </template>
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Inputs ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
          <template v-else>
            <v-text-field
              v-model="item.title"
              :label="$t('global.form_builder.title_input')"
              color="primary"
              hint="Public label. Ex: Name, Prefer state, Description, ..."
              persistent-placeholder
              placeholder="Enter a title for input..."
              variant="underlined"
              @blur="
                item.name = item.name ? item.name : Slugify.apply(item.title);
                $forceUpdate();
              "
            />

            <div v-if="!edit_name">
              <div class="d-flex justify-space-between pb-6 px-2">
                <div>
                  <small>{{ $t("global.form_builder.name_input") }}</small
                  ><br />
                  <b>{{ item.name ? item.name : "Auto generate.." }}</b>
                </div>

                <v-btn
                  icon
                  size="small"
                  variant="text"
                  @click="edit_name = true"
                >
                  <v-icon>{{ edit_name ? "lock_open" : "lock" }}</v-icon>
                </v-btn>
              </div>
            </div>
            <div v-else>
              <v-text-field
                v-model="item.name"
                :append-inner-icon="item.locked ? 'lock' : undefined"
                :disabled="item.locked"
                :label="$t('global.form_builder.name_input')"
                color="primary"
                hint="Ex: name, state, desc, ... Only lowercase Latin characters and numbers are permitted, and no whitespace is allowed."
                variant="underlined"
              />
            </div>

            <!-- select -->
            <template v-if="item.type === 'select'">
              <v-combobox
                v-model="item.selects"
                :items="[]"
                :label="$t('global.form_builder.value_input')"
                :messages="$t('global.form_builder.value_input_message')"
                chips
                clearable
                closable-chips
                multiple
                variant="underlined"
              >
                <template v-slot:chip="{ props, item }">
                  <v-chip v-bind="props">
                    {{ item.raw }}
                  </v-chip>
                </template>
              </v-combobox>

              <u-smart-switch
                v-model="item.multiple"
                border
                class="mt-3"
                false-description="User can select just one item."
                false-title="Single item"
                true-description="User can select more than one item."
                true-title="Multiple items"
                @change="$forceUpdate()"
              >
              </u-smart-switch>
            </template>

            <!-- switch -->

            <u-smart-switch
              v-if="item.type === 'switch'"
              v-model="item.default"
              :false-description="item.hint_false"
              :false-title="$t('global.form_builder.default') + ': False'"
              :true-description="item.hint_true"
              :true-title="$t('global.form_builder.default') + ': True'"
              border
              class="mt-3"
              false-icon="close"
              true-icon="check"
              @change="$forceUpdate()"
            >
            </u-smart-switch>

            <!-- Upload file -->
            <template v-if="item.type === 'file'">
              <v-combobox
                v-model="item.types"
                :items="['jpeg', 'png', 'zip', 'pdf']"
                :label="$t('global.form_builder.file_type_input')"
                :messages="$t('global.form_builder.file_type_message')"
                chips
                clearable
                closable-chips
                multiple
                persistent-placeholder
                placeholder="*.*"
                variant="underlined"
                class="mb-3"
              >
                <template v-slot:chip="{ props, item }">
                  <v-chip v-bind="props">
                    {{ item.raw }}
                  </v-chip>
                </template>
              </v-combobox>

              <u-smart-switch
                v-model="item.multiple"
                border
                false-description="User can upload just one file."
                false-title="Single file"
                true-description="User can upload more than one file."
                true-title="Multiple files"
                @change="$forceUpdate()"
              >
              </u-smart-switch>
            </template>

            <!-- -------------- Hints -------------- -->
            <v-btn
              class="tnt mt-2"
              color="primary"
              size="small"
              variant="text"
              @click="show_hints = !show_hints"
            >
              <v-icon start>arrow_drop_down</v-icon>
              Edit hints
            </v-btn>

            <v-btn
              v-if="hasRequired"
              @click.stop="item.required = !item.required"
              :variant="item.required ? 'flat' : 'tonal'"
              class="tnt mt-2"
              color="#000"
              size="small"
            >
              {{
                item.required
                  ? $t("global.commons.required")
                  : $t("global.commons.optional")
              }}
            </v-btn>

            <v-expand-transition>
              <div v-if="show_hints && item.type === 'switch'">
                <v-text-field
                  v-model="item.hint_true"
                  label="Hint True"
                  persistent-placeholder
                  placeholder="Some instruction to guide customer..."
                  variant="underlined"
                ></v-text-field>
                <v-text-field
                  v-model="item.hint_false"
                  label="Hint False"
                  persistent-placeholder
                  placeholder="Some instruction to guide customer..."
                  variant="underlined"
                ></v-text-field>
              </div>
              <div v-else-if="show_hints">
                <v-text-field
                  v-model="item.hint"
                  label="Hint"
                  persistent-placeholder
                  placeholder="Some instruction to guide customer..."
                  variant="underlined"
                ></v-text-field>
              </div>
            </v-expand-transition>
          </template>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import { Slugify } from "@selldone/core-js/utils/slugify/slugify.ts";

export default {
  name: "SFormBuilderRow",
  components: { USmartSwitch },
  emits: ["remove", "change", "move", "select"],
  props: {
    item: {
      required: true,
      type: Object,
    },

    itemTypes: {
      required: true,
      type: Array,
    },
    collapse: Boolean,
    hasRequired: Boolean,
    modern: { type: Boolean, default: false },
    focused: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
    position: Number,
    total: Number,
    readOnly: { type: Boolean, default: false },
    first: Boolean,
    last: Boolean,
  },

  data: () => ({
    Slugify: Slugify,

    show_hints: false,
    edit_name: false,
    expanded: true,
    noteFormats: [
      { tag: 'b', icon: 'format_bold', label: 'format_bold' },
      { tag: 'i', icon: 'format_italic', label: 'format_italic' },
      { tag: 'h3', icon: 'title', label: 'format_heading' },
      { tag: 'list', icon: 'format_list_bulleted', label: 'format_list' },
      { tag: 'link', icon: 'link', label: 'format_link' },
    ],
  }),

  computed: {
    summaryTitle() {
      if (this.item.type !== 'note') return this.item.title;
      const text = String(this.item.title || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return text.length > 160 ? text.slice(0, 157) + '…' : text;
    },
    isExpanded() {
      return !this.collapse && (this.focused ? this.selected : this.expanded);
    },
    type() {
      const found = this.itemTypes.find(
        (type) => type.value === this.item.type,
      );
      return found ? found : this.itemTypes[0];
    },
  },
  watch: {
    item: {
      handler() {
        this.$emit("change", this.item);
      },
      deep: true,
    },
  },
  created() {},
  methods: {
    formatNote(tag) {
      if (this.readOnly || this.item.type !== 'note') return;
      const input = this.$refs.titleInput?.$el?.querySelector('textarea');
      const wrappers = { b: ['<b>', '</b>'], i: ['<i>', '</i>'], h3: ['<h3>', '</h3>'], list: ['<ul><li>', '</li></ul>'], link: ['<a href="#">', '</a>'] };
      const pair = wrappers[tag];
      if (!input || !pair) return;
      const text = String(this.item.title || ''), start = input.selectionStart, end = input.selectionEnd;
      this.item.title = text.slice(0, start) + pair[0] + text.slice(start, end) + pair[1] + text.slice(end);
      this.$nextTick(() => { input.focus(); input.setSelectionRange(start + pair[0].length, end + pair[0].length); });
    },
    removeField() {
      if (this.readOnly) return;
      this.$emit("remove");
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

.s--form-builder-container {
  position: relative;
  background: #0061e0;
  padding: 6px;
  border-radius: 14px;
  color: #fff;

  .s--form-builder-item {
    color: #000;
    background: #fff;
    border-radius: 12px;
    padding: 12px;
    position: relative;
    transition: all 0.4s ease-in-out;

    &.-locked {
      border: solid #0061e0 3px;
    }
  }
}

.s-form-builder-row--modern {
  padding: 0;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  border: 1px solid var(--sd-modern-border);
  border-radius: 12px;
  .s-form-builder-row__fieldset {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }
  .s-form-builder-row__header {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) auto;
    align-items: center;
    gap: 9px;
    padding: 12px;
  }
  .s-form-builder-row__summary {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
    color: inherit;
    text-align: start;
  }
  .s-form-builder-row__summary > .v-icon {
    flex: 0 0 16px;
    margin-block-start: 2px;
    color: var(--sd-modern-muted);
  }
  .s-form-builder-row__summary strong {
    display: block;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  .s-form-builder-row__summary small {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.5;
  }
  .s-form-builder-row__summary .s-form-builder-row__note-summary {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  .s-form-builder-row__actions {
    display: flex;
    gap: 5px;
  }
  .s-form-builder-row__actions .sd-modern-icon-button {
    --sd-modern-icon-button-size: 32px;
  }
  .s-form-builder-row__actions :deep(.v-icon) {
    font-size: 16px !important;
  }
  .s-form-builder-row__fields {
    padding: 8px 18px 20px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .s-form-builder-row__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
  .s-form-builder-row__required {
    margin-block: 10px;
  }
  .s-form-builder-row__required :deep(.v-label) {
    font-size: 13px;
    opacity: 1;
  }
  .s-form-builder-row__hints {
    margin-block: 4px 8px;
    margin-inline-start: -8px;
  }
  .s-form-builder-row__switch {
    margin-block: 14px;
  }
  .s-form-builder-row__switch :deep(.row-hover) {
    padding: 12px !important;
    min-height: 64px;
    background: var(--sd-modern-inset) !important;
  }
  .s-form-builder-row__switch :deep(b) {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
  }
  .s-form-builder-row__switch :deep(.small) {
    font-size: 12px;
    line-height: 1.5;
  }
  .s-form-builder-row__switch :deep(.circle-check) {
    width: 20px;
    height: 20px;
  }
}
.s-form-builder-row--modern.s-form-builder-row--focused {
  overflow: hidden;
  &.is-selected { border-color: rgb(var(--v-theme-primary)); }
  .s-form-builder-row__header { grid-template-columns: 20px minmax(0, 1fr) auto; gap: 8px; width: 100%; margin: 0; min-height: 66px; padding: 12px 10px; }
  .s-form-builder-row__summary { align-items: center; gap: 10px; width: 100%; padding: 0; border: 0; background: transparent; font-family: inherit; }
  .s-form-builder-row__summary > span { flex: 1; min-width: 0; }
  .s-form-builder-row__summary > .v-icon:first-child { display: flex; align-items: center; justify-content: center; flex: 0 0 30px; width: 30px; height: 30px; padding: 7px; margin: 0; border-radius: 8px; background: var(--sd-modern-inset); font-size: 16px !important; }
  .s-form-builder-row__summary small { margin-block-start: 3px; }
  .s-form-builder-row__summary > .s-form-builder-row__chevron { flex: 0 0 14px; margin: 0; }
  .s-form-builder-row__fields { display: flex; flex-direction: column; gap: 12px; padding-block: 4px 18px; padding-inline: 48px 24px; background: var(--sd-modern-inset); }
  .s-form-builder-row__main-grid { display: contents; }
  .s-form-builder-row__identifier { order: 6; min-width: 0; margin-block-start: 4px; padding-block-start: 12px; border-block-start: 1px solid var(--sd-modern-border); }
  .s-form-builder-row__identifier summary { color: var(--sd-modern-muted); font-size: 11px; line-height: 1.5; list-style-position: inside; }
  .s-form-builder-row__identifier .v-input { margin-block-start: 10px; }
  .s-form-builder-row__title-input { order: 0; }
  .s-form-builder-row__hint-input { order: 1; }
  .s-form-builder-row__choices-input, .s-form-builder-row__switch { order: 2; }
  .s-form-builder-row__switch-hints { order: 3; gap: 14px 16px; }
  .s-form-builder-row__required { order: 4; margin: 0; }
  .s-form-builder-row__required :deep(.v-label) { font-size: 12px; font-weight: 400; }
  .s-form-builder-row__note-toolbar { display: flex; flex-wrap: wrap; gap: 6px; }
  .s-form-builder-row__note-toolbar .sd-modern-icon-button { --sd-modern-icon-button-size: 32px; }
  .s-form-builder-row__editor-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; order: 7; margin-block-start: 6px; color: var(--sd-modern-muted); font-size: 11px; }
  .sd-modern-underlined-field { --sd-modern-field-height: 56px; }
  .sd-modern-underlined-field :deep(.v-field__input) { font-size: 13px; font-weight: 400; line-height: 1.5; }
  .sd-modern-underlined-field :deep(input.v-field__input) { padding-block: 24px 8px; }
  .sd-modern-underlined-field :deep(.v-field-label--floating) { font-size: 11px; line-height: 16px; }
  .s-form-builder-row__switch { margin-block: 0; }
  .s-form-builder-row__switch :deep(b) { font-size: 12px; font-weight: 400; }
  .s-form-builder-row__switch :deep(.small) { font-size: 11px; }
}
@media (max-width: 600px), (pointer: coarse) {
  .s-form-builder-row--modern.s-form-builder-row--focused .s-form-builder-row__summary { min-height: 44px; }
  .s-form-builder-row--modern.s-form-builder-row--focused .s-form-builder-row__note-toolbar .sd-modern-icon-button { --sd-modern-icon-button-size: 44px; }
  .s-form-builder-row--modern.s-form-builder-row--focused .sd-modern-underlined-field :deep(.v-field__input) { font-size: 16px; }
}
@media (max-width: 480px) {
  .s-form-builder-row--modern.s-form-builder-row--focused {
    .s-form-builder-row__header { grid-template-columns: 18px minmax(0, 1fr) auto; gap: 4px; padding: 10px 7px; }
    .s-form-builder-row__header > .s-form-builder-row__actions { grid-column: auto; }
    .s-form-builder-row__summary > .v-icon:first-child { display: none; }
    .s-form-builder-row__fields { padding-inline: 14px; }
    .s-form-builder-row__grid { grid-template-columns: minmax(0, 1fr); }
  }
}
@media (max-width: 600px) {
  .s-form-builder-row--modern {
    .s-form-builder-row__header {
      grid-template-columns: 24px minmax(0, 1fr);
    }
    .s-form-builder-row__actions {
      grid-column: 2;
      justify-content: flex-end;
    }
    .s-form-builder-row__fields {
      padding-inline: 12px;
    }
    .s-form-builder-row__grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
    .s-form-builder-row__actions .sd-modern-icon-button {
      --sd-modern-icon-button-size: 44px;
    }
  }
}
@media (pointer: coarse) {
  .s-form-builder-row--modern
    .s-form-builder-row__actions
    .sd-modern-icon-button {
    --sd-modern-icon-button-size: 44px;
  }
}
</style>
