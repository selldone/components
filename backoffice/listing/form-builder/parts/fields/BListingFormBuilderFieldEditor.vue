<!--
  - Copyright (c) 2023-2026. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved.
  -->

<template>
  <v-card variant="outlined" rounded="lg" class="sld-bfb-field">
    <v-card-text class="text-start">
      <div class="d-flex align-center mb-3">
        <div class="font-weight-black">Input</div>
        <v-spacer />

        <v-chip
          v-if="isOfficial"
          size="x-small"
          variant="tonal"
          label
          class="text-amber-darken-3"
        >
          <v-icon start size="16">star</v-icon>
          Official
        </v-chip>

        <v-chip v-else size="x-small" variant="tonal" label>
          {{ baseTypeLabel }}
        </v-chip>
      </div>

      <!--
        Type picker supports:
        - custom types
        - select presets (select:grid / select:list / select:chips)
        - official types (official:*)
      -->
      <v-select
        :model-value="typePickerValue"
        :items="typeItems"
        item-title="title"
        item-value="value"
        label="Input type"
        variant="underlined"
        @update:modelValue="onTypeChange"
      />

      <v-alert
        v-if="isOfficial"
        type="info"
        variant="tonal"
        border="start"
        class="mt-3"
      >
        Official fields are stored directly in dedicated database columns (not inside <code>meta</code>).
      </v-alert>

      <v-divider class="my-4" />

      <!-- Custom field settings (delegated to per-type component) -->
      <component
        v-if="configComponent"
        :is="configComponent"
        :model-value="local"
        @update:modelValue="onChildUpdate"
      />

      <!-- Official field settings (minimal) -->
      <div v-else class="text-muted">
        No extra settings.
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import BListingFormBuilderFieldText from "./BListingFormBuilderFieldText.vue";
import BListingFormBuilderFieldTextarea from "./BListingFormBuilderFieldTextarea.vue";
import BListingFormBuilderFieldNumber from "./BListingFormBuilderFieldNumber.vue";
import BListingFormBuilderFieldSwitch from "./BListingFormBuilderFieldSwitch.vue";
import BListingFormBuilderFieldSelect from "./BListingFormBuilderFieldSelect.vue";
import BListingFormBuilderFieldMap from "./BListingFormBuilderFieldMap.vue";
import BListingFormBuilderFieldMedia from "./BListingFormBuilderFieldMedia.vue";

type FieldTypePreset = {
  type: string;
  variant: string | null;
};

export default {
  name: "BListingFormBuilderFieldEditor",

  components: {
    BListingFormBuilderFieldText,
    BListingFormBuilderFieldTextarea,
    BListingFormBuilderFieldNumber,
    BListingFormBuilderFieldSwitch,
    BListingFormBuilderFieldSelect,
    BListingFormBuilderFieldMap,
    BListingFormBuilderFieldMedia,
  },

  props: {
    /**
     * ✅ Standard v-model API (new)
     */
    modelValue: { type: Object, default: null },

    /**
     * ✅ Backward-compatible API (old)
     * Some older code used :field / @update:field
     */
    field: { type: Object, default: undefined },
  },

  emits: ["update:modelValue", "update:field"],

  data: () => ({
    local: null as any,
    _syncing: false,
  }),

  computed: {
    /**
     * Prefer modelValue when provided, otherwise fallback to field
     * (keeps older callers working).
     */
    sourceValue(): any {
      const mv = (this as any).modelValue;
      if (mv !== undefined) return mv;
      return (this as any).field;
    },

    isOfficial(): boolean {
      return this.isOfficialType(this.local?.type);
    },

    baseTypeLabel(): string {
      const t = String(this.local?.type || "text");
      if (t === "select") return `select:${String(this.local?.variant || "grid")}`;
      return t;
    },

    typeItems(): any[] {
      return [
        // Custom
        { title: "Text", value: "text" },
        { title: "Textarea", value: "textarea" },
        { title: "Number", value: "number" },
        { title: "Switch", value: "switch" },

        // Select presets
        { title: "Select (grid)", value: "select:grid" },
        { title: "Select (list)", value: "select:list" },
        { title: "Select (chips)", value: "select:chips" },

        { title: "Map", value: "map" },
        { title: "Media uploader", value: "media" },

        // Official
        { title: "★ Official: Title", value: "official:title" },
        { title: "★ Official: Subtitle", value: "official:subtitle" },
        { title: "★ Official: Description", value: "official:description" },
        { title: "★ Official: Price", value: "official:price" },
        { title: "★ Official: Location", value: "official:location" },
        { title: "★ Official: Contact info", value: "official:contact" },
        { title: "★ Official: Opening hours", value: "official:opening_hours" },
        { title: "★ Official: Links", value: "official:links" },
        { title: "★ Official: Media gallery", value: "official:media" },
      ];
    },

    typePickerValue(): string {
      const t = String(this.local?.type || "text");
      if (t === "select") {
        const v = String(this.local?.variant || "grid");
        return `select:${v}`;
      }
      return t;
    },

    configComponent(): any {
      const t = String(this.local?.type || "text");
      if (this.isOfficialType(t)) return null;

      const map: Record<string, string> = {
        text: "BListingFormBuilderFieldText",
        textarea: "BListingFormBuilderFieldTextarea",
        number: "BListingFormBuilderFieldNumber",
        switch: "BListingFormBuilderFieldSwitch",
        select: "BListingFormBuilderFieldSelect",
        map: "BListingFormBuilderFieldMap",
        media: "BListingFormBuilderFieldMedia",
      };

      return map[t] || null;
    },
  },

  watch: {
    sourceValue: {
      immediate: true,
      deep: false,
      handler(v: any) {
        this._syncing = true;
        this.local = this.ensureFieldDefaults(this.clone(v || {}));
        this._syncing = false;
      },
    },
  },

  methods: {
    emitValue(next: any) {
      if (this._syncing) return;
      const out = this.clone(next);
      this.$emit("update:modelValue", out);
      this.$emit("update:field", out);
    },

    clone(obj: any) {
      try {
        return JSON.parse(JSON.stringify(obj || {}));
      } catch {
        return {};
      }
    },

    makeUid(prefix = "fld") {
      try {
        // @ts-ignore
        if (globalThis.crypto?.getRandomValues) {
          // @ts-ignore
          const a = globalThis.crypto.getRandomValues(new Uint32Array(2));
          return `${prefix}_${a[0].toString(16)}${a[1].toString(16)}`;
        }
      } catch {
        // ignore
      }
      return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
    },

    isOfficialType(type: any): boolean {
      return String(type || "").startsWith("official:");
    },

    officialName(type: string): string {
      const t = String(type || "").trim();
      const map: Record<string, string> = {
        "official:title": "title",
        "official:subtitle": "subtitle",
        "official:description": "description",
        "official:price": "price",
        "official:location": "location",
        "official:contact": "contact",
        "official:opening_hours": "opening_hours",
        "official:links": "links",
        "official:media": "media",
      };
      return map[t] || t.replace(/^official:/, "");
    },

    parseTypePicker(v: any): FieldTypePreset {
      const raw = String(v || "").trim();
      if (!raw) return { type: "text", variant: null };

      if (raw.startsWith("select:")) {
        const variant = raw.split(":")[1] || "grid";
        return { type: "select", variant };
      }

      return { type: raw, variant: null };
    },

    onTypeChange(v: any) {
      const picked = this.parseTypePicker(v);
      const prev = this.clone(this.local || {});

      const base: any = {
        uid: prev.uid || this.makeUid("fld"),
        type: picked.type,
      };

      // Keep common values when switching.
      base.title = prev.title || "";
      base.required = !!prev.required;

      if (this.isOfficialType(picked.type)) {
        base.name = this.officialName(picked.type);
      } else {
        base.name = prev.name || "field";
      }

      // Select preset
      if (picked.type === "select") {
        base.variant = picked.variant || prev.variant || "grid";
        base.options = Array.isArray(prev.options) ? prev.options : [];

        // Chips implies multiple.
        if ((picked.variant || "").toLowerCase() === "chips") {
          base.multiple = true;
        } else {
          base.multiple =
            prev.multiple !== undefined && prev.multiple !== null
              ? !!prev.multiple
              : false;
        }
      }

      const next = this.ensureFieldDefaults(base);
      this.local = next;

      this.emitValue(next);
    },

    onChildUpdate(v: any) {
      const next = this.ensureFieldDefaults(this.clone(v || {}));
      this.local = next;
      this.emitValue(next);
    },

    ensureOptionDefaults(opt: any) {
      const o = opt || {};

      if (!o.id) o.id = this.makeUid("opt");
      if (o.title === undefined || o.title === null) o.title = "";
      if (o.subtitle === undefined || o.subtitle === null) o.subtitle = "";
      if (o.icon === undefined || o.icon === null) o.icon = "";
      if (o.image === undefined || o.image === null) o.image = "";
      if (o.value === undefined || o.value === null) o.value = "";

      return o;
    },

    ensureFieldDefaults(field: any) {
      const f: any = field || {};

      if (!f.uid) f.uid = this.makeUid("fld");

      // Backward compatibility: type stored as select:grid
      if (typeof f.type === "string" && f.type.startsWith("select:")) {
        const p = this.parseTypePicker(f.type);
        f.type = p.type;
        if (p.variant) f.variant = p.variant;
      }

      if (!f.type) f.type = "text";

      // title/required
      if (f.title === undefined || f.title === null) f.title = "";
      if (f.required === undefined || f.required === null) f.required = false;

      // name
      if (this.isOfficialType(f.type)) {
        f.name = this.officialName(f.type);
      } else {
        if (!f.name) f.name = "field";
      }

      // type-specific
      if (f.type === "text") {
        if (f.placeholder === undefined || f.placeholder === null) f.placeholder = "";
        if (f.maxLength === undefined || f.maxLength === null) f.maxLength = 120;
      }

      if (f.type === "textarea") {
        if (f.placeholder === undefined || f.placeholder === null) f.placeholder = "";
        if (f.rows === undefined || f.rows === null) f.rows = 4;
        if (f.maxLength === undefined || f.maxLength === null) f.maxLength = 500;
      }

      if (f.type === "number") {
        if (f.min === undefined) f.min = null;
        if (f.max === undefined) f.max = null;
        if (f.step === undefined || f.step === null) f.step = 1;
      }

      if (f.type === "switch") {
        if (f.trueLabel === undefined || f.trueLabel === null) f.trueLabel = "Yes";
        if (f.falseLabel === undefined || f.falseLabel === null) f.falseLabel = "No";
      }

      if (f.type === "select") {
        if (!f.variant) f.variant = "grid"; // grid | list | chips
        if (f.columns === undefined || f.columns === null) f.columns = 3;

        if (f.multiple === undefined || f.multiple === null) f.multiple = false;
        if (f.variant === "chips") f.multiple = true;

        if (!Array.isArray(f.options)) f.options = [];
        f.options = (f.options || []).map((o: any) => this.ensureOptionDefaults(o));

        // keep at least 1 option for UX
        if (!f.options.length) {
          f.options = [this.ensureOptionDefaults({})];
        }
      }

      if (f.type === "map") {
        if (f.defaultZoom === undefined || f.defaultZoom === null) f.defaultZoom = 12;
        if (f.allowManualPin === undefined || f.allowManualPin === null) f.allowManualPin = true;
      }

      if (f.type === "media") {
        if (f.multiple === undefined || f.multiple === null) f.multiple = true;
        if (f.maxFiles === undefined || f.maxFiles === null) f.maxFiles = 10;
        if (f.accept === undefined || f.accept === null) f.accept = "image/*";
      }

      return f;
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-field {
  background: rgba(255, 255, 255, 0.96);
}
</style>