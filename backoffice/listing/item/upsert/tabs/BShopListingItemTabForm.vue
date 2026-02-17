<template>
  <div class="text-start">
    <!-- Header -->
    <div class="widget-box -large mb-5">
      <u-widget-header :title="resolvedTitle" :icon="icon" />
      <v-list-subheader v-if="subtitle">{{ subtitle }}</v-list-subheader>

      <v-alert v-if="!schemaSafe.length" type="info" variant="tonal" class="mb-0">
        No custom fields defined.
      </v-alert>
    </div>

    <div v-for="(field, index) in schemaSafe" :key="fieldKey(field, index)">
      <!-- NOTE -->
      <div
        v-if="fieldType(field) === 'note'"
        class="mb-4 widget-box -large sld-note"
        style="--background: #fff"
      >
        <v-icon class="me-1">info_outline</v-icon>
        {{ fieldTitle(field) }}
      </div>

      <!-- Field -->
      <div v-else class="widget-box -large mb-4 sld-field">
        <u-widget-header :title="fieldTitle(field)" icon="input">
          <template v-slot:actions>
            <small v-if="showKey && fieldName(field)" class="text-muted d-block mt-2">
              Key: <b>{{ fieldName(field) }}</b>
            </small>

            <v-btn
              v-if="fieldType(field) === 'key_value'"
              size="small"
              variant="text"
              class="me-2"
              :disabled="disabled"
              @click.stop="addKeyValueRow(fieldName(field))"
            >
              <v-icon start>add</v-icon>
              Add
            </v-btn>

            <v-chip
              v-if="isRequired(field)"
              label
              size="x-small"
              color="#000"
              variant="flat"
            >
              {{ $t("global.commons.required") }}
            </v-chip>
          </template>
        </u-widget-header>

        <v-list-subheader v-if="fieldHint(field)">
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
                class="flex-grow-1"
                @update:modelValue="setKeyValueRowKey(fieldName(field), ri, $event)"
                @blur="$emit('changed')"
              />

              <v-btn
                icon
                variant="text"
                class="ms-2"
                :disabled="disabled || keyValueList(fieldName(field)).length <= 1"
                @click.stop="removeKeyValueRow(fieldName(field), ri)"
              >
                <v-icon>close</v-icon>
              </v-btn>
            </div>

            <v-textarea
              :model-value="rowValue(row)"
              :disabled="disabled"
              :label="fieldValueLabel(field)"
              variant="underlined"
              auto-grow
              rows="3"
              @update:modelValue="setKeyValueRowValue(fieldName(field), ri, $event)"
              @blur="$emit('changed')"
            />
          </div>

          <v-btn
            size="small"
            variant="text"
            :disabled="disabled"
            @click.stop="addKeyValueRow(fieldName(field))"
          >
            <v-icon start>add</v-icon>
            Add another
          </v-btn>
        </div>

        <!-- text -->
        <v-textarea
          v-else-if="fieldType(field) === 'text'"
          :model-value="valueOf(fieldName(field))"
          :disabled="disabled"
          :label="fieldValueLabel(field)"
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
          variant="underlined"
          clearable
          @update:modelValue="setFieldValue(fieldName(field), $event)"
          @blur="$emit('changed')"
        />

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

  props: {
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
      return (n ? `${t}_${n}` : `${t}__field_${index}`);
    },

    fieldType(field: any): string {
      const raw = field?.type;
      const t = raw === null || raw === undefined || raw === "" ? "text" : String(raw).trim();

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
      return n || "Note";
    },

    fieldHint(field: any): string {
      return field?.hint ? String(field.hint) : "";
    },

    fieldHintTrue(field: any): string {
      return field?.hint_true ? String(field.hint_true) : "Enabled";
    },

    fieldHintFalse(field: any): string {
      return field?.hint_false ? String(field.hint_false) : "";
    },

    fieldTrueTitle(_field: any): string {
      return "Enabled";
    },

    fieldSelects(field: any): any[] {
      return Array.isArray(field?.selects) ? field.selects : [];
    },

    fieldKeyLabel(field: any): string {
      return field?.key_label ? String(field.key_label) : "Key";
    },

    fieldValueLabel(field: any): string {
      return field?.value_label ? String(field.value_label) : "Value";
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
        this.metaFields && typeof this.metaFields === "object" ? this.metaFields : {};

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
</style>
