<template>
  <div
    class="text-start"
    :class="modern ? 'b-listing-custom-form sd-modern-widget' : undefined"
  >
    <!-- Header -->
    <div
      :class="
        modern ? 'b-listing-custom-form__header' : 'widget-box -large mb-5'
      "
    >
      <header v-if="modern" class="sd-modern-header">
        <div class="sd-modern-title">
          <v-icon
            class="sd-modern-icon sd-modern-icon--plain"
            size="22"
            aria-hidden="true"
            >{{ icon }}</v-icon
          >
          <div>
            <h2 class="sd-modern-title-text">{{ resolvedTitle }}</h2>
            <p v-if="subtitle" class="sd-modern-subtitle">{{ subtitle }}</p>
          </div>
        </div>
      </header>
      <u-widget-header v-else :title="resolvedTitle" :icon="icon" />
      <v-list-subheader v-if="subtitle && !modern">{{
        subtitle
      }}</v-list-subheader>

      <div
        v-if="modern && !schemaSafe.length"
        class="sd-modern-empty-state"
        role="status"
      >
        <v-icon size="28" aria-hidden="true">data_object</v-icon>
        <p>{{ $t("shop_listing.item_editor.no_custom_fields") }}</p>
      </div>
      <v-alert
        v-if="!modern && !schemaSafe.length"
        type="info"
        variant="tonal"
        class="mb-0"
      >
        No custom fields defined.
      </v-alert>
    </div>

    <div v-for="(field, index) in schemaSafe" :key="fieldKey(field, index)">
      <!-- NOTE -->
      <div
        v-if="fieldType(field) === 'note'"
        :class="
          modern
            ? 'sd-modern-notice b-listing-custom-form__note'
            : 'mb-4 widget-box -large sld-note'
        "
        :style="modern ? undefined : '--background: #fff'"
      >
        <v-icon class="me-1">info_outline</v-icon>
        <span :class="{ 'sd-modern-notice__content': modern }">{{
          fieldTitle(field)
        }}</span>
      </div>

      <!-- Field -->
      <div
        v-else
        :class="
          modern
            ? 'b-listing-custom-form__field'
            : 'widget-box -large mb-4 sld-field'
        "
      >
        <u-widget-header
          :class="
            modern
              ? 'sd-modern-form-header b-listing-custom-form__field-header'
              : undefined
          "
          :title="fieldTitle(field)"
          icon="input"
        >
          <template v-slot:actions>
            <small
              v-if="showKey && fieldName(field)"
              class="text-muted d-block mt-2"
              :class="{ 'b-listing-custom-form__key': modern }"
            >
              {{ modern ? $t("shop_listing.item_editor.field_key") : "Key" }}:
              <b>{{ fieldName(field) }}</b>
            </small>

            <v-btn
              v-if="!modern && fieldType(field) === 'key_value'"
              size="small"
              variant="text"
              :class="
                modern
                  ? 'sd-modern-button sd-modern-button--inline me-2'
                  : 'me-2'
              "
              :disabled="disabled"
              @click.stop="addKeyValueRow(fieldName(field))"
            >
              <v-icon start>add</v-icon>
              {{ modern ? $t("global.actions.add") : "Add" }}
            </v-btn>

            <v-chip
              v-if="isRequired(field) && !modern"
              label
              size="x-small"
              color="#000"
              variant="flat"
            >
              {{ $t("global.commons.required") }}
            </v-chip>
            <span
              v-if="isRequired(field) && modern"
              class="b-listing-custom-form__required"
              >{{ $t("global.commons.required") }}</span
            >
          </template>
        </u-widget-header>

        <p v-if="modern && fieldHint(field)" class="sd-modern-subtitle mb-4">
          {{ fieldHint(field) }}
        </p>
        <v-list-subheader v-if="!modern && fieldHint(field)">
          {{ fieldHint(field) }}
        </v-list-subheader>

        <!-- key_value: LIST -->
        <div v-if="fieldType(field) === 'key_value'">
          <div
            v-for="(row, ri) in keyValueList(fieldName(field))"
            :key="`${fieldName(field)}_${ri}`"
            class="mb-3"
          >
            <div class="d-flex align-center">
              <v-text-field
                :model-value="rowKey(row)"
                :disabled="disabled"
                :label="`${fieldKeyLabel(field)} #${ri + 1}`"
                variant="underlined"
                :class="
                  modern
                    ? 'flex-grow-1 sd-modern-underlined-field'
                    : 'flex-grow-1'
                "
                @update:modelValue="
                  setKeyValueRowKey(fieldName(field), ri, $event)
                "
                @blur="$emit('changed')"
              />

              <v-btn
                icon
                variant="text"
                :class="modern ? 'ms-2 sd-modern-icon-button' : 'ms-2'"
                :aria-label="
                  modern ? $t('shop_listing.item_editor.remove_row') : undefined
                "
                :disabled="
                  disabled || keyValueList(fieldName(field)).length <= 1
                "
                @click.stop="removeKeyValueRow(fieldName(field), ri)"
              >
                <v-icon>close</v-icon
                ><v-tooltip
                  v-if="modern"
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  >{{ $t("shop_listing.item_editor.remove_row") }}</v-tooltip
                >
              </v-btn>
            </div>

            <v-textarea
              :model-value="rowValue(row)"
              :disabled="disabled"
              :label="fieldValueLabel(field)"
              :class="modern ? 'sd-modern-underlined-field' : undefined"
              variant="underlined"
              auto-grow
              rows="3"
              @update:modelValue="
                setKeyValueRowValue(fieldName(field), ri, $event)
              "
              @blur="$emit('changed')"
            />
          </div>

          <v-btn
            size="small"
            :class="
              modern ? 'sd-modern-button sd-modern-button--inline' : undefined
            "
            variant="text"
            :disabled="disabled"
            @click.stop="addKeyValueRow(fieldName(field))"
          >
            <v-icon start>add</v-icon>
            {{
              modern
                ? $t("shop_listing.item_editor.add_another")
                : "Add another"
            }}
          </v-btn>
        </div>

        <!-- text -->
        <v-textarea
          v-else-if="fieldType(field) === 'text'"
          :model-value="valueOf(fieldName(field))"
          :disabled="disabled"
          :label="fieldValueLabel(field)"
          :class="modern ? 'sd-modern-underlined-field' : undefined"
          variant="underlined"
          auto-grow
          rows="3"
          @update:modelValue="setFieldValue(fieldName(field), $event)"
          @blur="$emit('changed')"
        />

        <!-- select -->
        <v-select
          v-else-if="fieldType(field) === 'select'"
          :model-value="valueOf(fieldName(field))"
          :disabled="disabled"
          :items="fieldSelects(field)"
          :label="fieldValueLabel(field)"
          :multiple="!!field?.multiple"
          :chips="!!field?.multiple"
          :class="modern ? 'sd-modern-underlined-field' : undefined"
          variant="underlined"
          clearable
          @update:modelValue="setFieldValue(fieldName(field), $event)"
          @blur="$emit('changed')"
        >
          <template v-if="modern" #chip="{ item, props }">
            <v-chip
              v-bind="props"
              size="small"
              label
              class="b-listing-custom-form__chip"
            >
              <span
                v-overflow-check="
                  (clipped) =>
                    (clippedSelections[`${index}:${item.value}`] = clipped)
                "
                class="b-listing-custom-form__selection"
                :tabindex="
                  clippedSelections[`${index}:${item.value}`] ? 0 : undefined
                "
                @click="
                  clippedSelections[`${index}:${item.value}`] &&
                  $event.stopPropagation()
                "
              >
                {{ item.title }}
                <v-tooltip
                  activator="parent"
                  :disabled="!clippedSelections[`${index}:${item.value}`]"
                  location="top"
                  open-on-focus
                  open-on-click
                  content-class="sd-modern-tooltip text-start"
                  >{{ item.title }}</v-tooltip
                >
              </span>
            </v-chip>
          </template>
        </v-select>

        <!-- switch -->
        <u-smart-toggle
          v-else-if="fieldType(field) === 'switch'"
          :model-value="!!valueOf(fieldName(field))"
          :disabled="disabled"
          :true-title="fieldTrueTitle(field)"
          :true-description="fieldHintTrue(field)"
          :false-description="fieldHintFalse(field)"
          false-gray
          class="mx-1 mt-2 mb-2"
          @update:modelValue="setFieldValue(fieldName(field), $event)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";

export default {
  name: "BShopListingItemTabForm",

  components: { USmartToggle },

  directives: {
    overflowCheck: {
      mounted(element, binding) {
        const state = { notify: binding.value, observer: null, measure: null };
        state.measure = () =>
          state.notify(element.scrollWidth > element.clientWidth + 1);
        state.observer = new ResizeObserver(state.measure);
        state.observer.observe(element);
        element._listingSelectionOverflow = state;
        state.measure();
      },
      updated(element, binding) {
        const state = element._listingSelectionOverflow;
        state.notify = binding.value;
        state.measure();
      },
      beforeUnmount(element) {
        element._listingSelectionOverflow.observer.disconnect();
        delete element._listingSelectionOverflow;
      },
    },
  },

  data: () => ({ clippedSelections: {} as Record<string, boolean> }),

  props: {
    modern: { type: Boolean, default: false },
    title: { type: String, default: null },
    subtitle: { type: String, default: "" },
    icon: { type: String, default: "data_object" },

    // Schema is consumed as-is (created by SFormBuilder).
    schema: { type: Array, default: () => [] },

    metaFields: { type: Object, default: () => ({}) },

    disabled: { type: Boolean, default: false },
    showKey: { type: Boolean, default: true },
  },

  emits: ["update:metaFields", "changed"],

  computed: {
    resolvedTitle(): string {
      if (this.title) return this.title;
      // @ts-ignore
      return typeof this.$t === "function"
        ? this.$t("shop_listing.items.form_fields")
        : "Form Fields";
    },

    schemaSafe(): any[] {
      return Array.isArray(this.schema) ? this.schema : [];
    },
  },

  watch: {
    schema: {
      immediate: true,
      handler() {
        this.applyDefaults();
      },
    },
    metaFields: {
      immediate: true,
      deep: true,
      handler() {
        this.applyDefaults();
      },
    },
  },

  methods: {
    fieldKey(field: any, index: number) {
      const n = field?.name ? String(field.name) : "";
      const t = field?.type ? String(field.type) : "text";
      return n ? `${t}_${n}` : `${t}__field_${index}`;
    },

    fieldType(field: any): string {
      const raw = field?.type;
      const t =
        raw === null || raw === undefined || raw === ""
          ? "text"
          : String(raw).trim();

      if (t === "note") return "note";
      if (t === "switch") return "switch";
      if (t === "select") return "select";
      if (t === "key_value") return "key_value";
      return "text";
    },

    fieldName(field: any): string {
      return field?.name ? String(field.name) : "";
    },

    fieldTitle(field: any): string {
      if (field?.title) return String(field.title);
      const n = this.fieldName(field);
      return (
        n || (this.modern ? this.$t("shop_listing.item_editor.note") : "Note")
      );
    },

    fieldHint(field: any): string {
      return field?.hint ? String(field.hint) : "";
    },

    fieldHintTrue(field: any): string {
      return field?.hint_true
        ? String(field.hint_true)
        : this.modern
          ? this.$t("shop_listing.item_editor.enabled")
          : "Enabled";
    },

    fieldHintFalse(field: any): string {
      return field?.hint_false ? String(field.hint_false) : "";
    },

    fieldTrueTitle(_field: any): string {
      return this.modern
        ? this.$t("shop_listing.item_editor.enabled")
        : "Enabled";
    },

    fieldSelects(field: any): any[] {
      return Array.isArray(field?.selects) ? field.selects : [];
    },

    fieldKeyLabel(field: any): string {
      return field?.key_label
        ? String(field.key_label)
        : this.modern
          ? this.$t("shop_listing.item_editor.key_label")
          : "Key";
    },

    fieldValueLabel(field: any): string {
      return field?.value_label
        ? String(field.value_label)
        : this.modern
          ? this.$t("shop_listing.item_editor.value_label")
          : "Value";
    },

    isRequired(field: any): boolean {
      return !!field?.required;
    },

    valueOf(name: string) {
      const obj: any = this.metaFields || {};
      return Object.prototype.hasOwnProperty.call(obj, name) ? obj[name] : null;
    },

    setFieldValue(name: string, value: any) {
      if (!name) return;

      const current: any =
        this.metaFields && typeof this.metaFields === "object"
          ? this.metaFields
          : {};

      this.$emit("update:metaFields", { ...current, [name]: value });
      this.$emit("changed");
    },

    // key_value stored format:
    // metaFields[name] = [ { key, value }, ... ]
    normalizeKeyValueList(v: any): Array<{ key: string; value: string }> {
      if (Array.isArray(v)) {
        return v
          .map((r: any) => {
            if (r && typeof r === "object" && !Array.isArray(r)) {
              return { key: String(r.key ?? ""), value: String(r.value ?? "") };
            }
            return null;
          })
          .filter(Boolean) as any[];
      }

      if (v && typeof v === "object" && !Array.isArray(v)) {
        return [{ key: String(v.key ?? ""), value: String(v.value ?? "") }];
      }

      if (typeof v === "string") {
        return [{ key: "", value: v }];
      }

      return [];
    },

    keyValueList(name: string): Array<{ key: string; value: string }> {
      const v = this.valueOf(name);
      const list = this.normalizeKeyValueList(v);
      return list.length ? list : [{ key: "", value: "" }];
    },

    rowKey(row: any): string {
      return String(row?.key ?? "");
    },

    rowValue(row: any): string {
      return String(row?.value ?? "");
    },

    setKeyValueList(name: string, list: Array<{ key: string; value: string }>) {
      this.setFieldValue(name, Array.isArray(list) ? list : []);
    },

    addKeyValueRow(name: string) {
      if (!name || this.disabled) return;
      const list = this.normalizeKeyValueList(this.valueOf(name));
      list.push({ key: "", value: "" });
      this.setKeyValueList(name, list);
    },

    removeKeyValueRow(name: string, index: number) {
      if (!name || this.disabled) return;
      const list = this.normalizeKeyValueList(this.valueOf(name));
      if (list.length <= 1) return;
      list.splice(index, 1);
      this.setKeyValueList(name, list);
    },

    setKeyValueRowKey(name: string, index: number, newKey: any) {
      if (!name) return;

      const list = this.normalizeKeyValueList(this.valueOf(name));
      while (list.length <= index) list.push({ key: "", value: "" });

      list[index] = { ...list[index], key: String(newKey ?? "") };
      this.setKeyValueList(name, list);
    },

    setKeyValueRowValue(name: string, index: number, newVal: any) {
      if (!name) return;

      const list = this.normalizeKeyValueList(this.valueOf(name));
      while (list.length <= index) list.push({ key: "", value: "" });

      list[index] = { ...list[index], value: String(newVal ?? "") };
      this.setKeyValueList(name, list);
    },

    applyDefaults() {
      const current: any =
        this.metaFields && typeof this.metaFields === "object"
          ? { ...this.metaFields }
          : {};

      let changed = false;

      (this.schemaSafe || []).forEach((field: any) => {
        const type = this.fieldType(field);
        if (type === "note") return;

        const name = this.fieldName(field);
        if (!name) return;

        if (current[name] !== undefined) return;

        if (Object.prototype.hasOwnProperty.call(field || {}, "default")) {
          current[name] = field.default;
          changed = true;
          return;
        }

        if (type === "switch") {
          current[name] = false;
          changed = true;
          return;
        }

        if (type === "key_value") {
          current[name] = [{ key: "", value: "" }];
          changed = true;
        }
      });

      if (changed) {
        this.$emit("update:metaFields", current);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-note {
  border: 1px solid rgba(20, 20, 20, 0.08);
  background: rgba(0, 0, 0, 0.01);
}

.sld-field {
  border: 1px solid rgba(20, 20, 20, 0.08);
  background: rgba(0, 0, 0, 0.01);
}

.b-listing-custom-form {
  padding: 24px;
  border: 0;
  border-radius: 16px;
  box-shadow: none;
  font-size: 14px;
  line-height: 1.6;
}
.b-listing-custom-form .sd-modern-title-text {
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}
.b-listing-custom-form .sd-modern-subtitle {
  margin-block-start: 5px;
  font-size: 13px;
  line-height: 21px;
}
.b-listing-custom-form__field {
  margin-block-start: 28px;
}
.b-listing-custom-form__field:first-child {
  margin-block-start: 0;
}
.b-listing-custom-form__field small {
  font-size: 13px;
  font-weight: 400;
}
.b-listing-custom-form__field-header {
  flex-wrap: wrap;
  gap: 8px;
}
.b-listing-custom-form__field-header :deep(> .flex-grow-1) {
  min-width: 0;
  flex-wrap: wrap;
}
.b-listing-custom-form__field-header :deep(h2) {
  min-width: 0;
  overflow-wrap: anywhere;
}
.b-listing-custom-form__field-header :deep(.--icon) {
  flex-shrink: 0;
}
.b-listing-custom-form__key {
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
}
.b-listing-custom-form .sd-modern-subtitle,
.b-listing-custom-form__note {
  overflow-wrap: anywhere;
}
.b-listing-custom-form__chip {
  max-width: 100%;
}
.b-listing-custom-form__chip :deep(.v-chip__content) {
  min-width: 0;
}
.b-listing-custom-form__selection {
  display: block;
  min-width: 0;
  max-width: 32ch;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.b-listing-custom-form__required {
  font-size: 13px;
  font-weight: 400;
  color: var(--sd-modern-muted);
}
.b-listing-custom-form__note {
  margin-block: 20px;
}
@media (max-width: 600px) {
  .b-listing-custom-form {
    padding: 18px;
  }
}
</style>
