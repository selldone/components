<!--
  - Selldone® Business OS™
  - Backoffice Listing Form Builder
  - Select field editor (compact options list + expandable editor + drag reorder)
-->

<template>
  <div class="sld-bfb-select">
    <v-text-field
      :model-value="String(fieldProxy.title || '')"
      label="Question"
      variant="underlined"
      @update:modelValue="(v) => patchField({ title: String(v || '') })"
    />

    <v-text-field
      :model-value="String(fieldProxy.name || '')"
      label="Key (stored in meta)"
      variant="underlined"
      hint="Use a stable key like: insurance, languages, practice_areas"
      persistent-hint
      @update:modelValue="(v) => patchField({ name: String(v || '') })"
    />

    <div class="d-flex align-center gap-2 flex-wrap mt-3">
      <v-select
        :model-value="String(fieldProxy.variant || 'grid')"
        :items="variantOptions"
        label="Style"
        variant="underlined"
        class="max-w-220"
        @update:modelValue="onVariantChange"
      />

      <v-select
        v-if="String(fieldProxy.variant || 'grid') === 'grid'"
        :model-value="Number(fieldProxy.columns || 3)"
        :items="[2,3,4,5].map(n=>({title:`${n} columns`, value:n}))"
        label="Columns"
        variant="underlined"
        class="max-w-220"
        @update:modelValue="(v) => patchField({ columns: toInt(v, 3) })"
      />

      <u-smart-toggle
        :model-value="!!fieldProxy.multiple"
        true-title="Multiple"
        false-title="Single"
        false-gray
        class="ms-auto"
        @update:modelValue="(v) => patchField({ multiple: !!v })"
      />
    </div>

    <v-divider class="my-4" />

    <!-- Options header -->
    <div class="d-flex align-center mb-2">
      <div class="font-weight-black">Options</div>
      <v-spacer />
      <v-chip size="x-small" variant="tonal" label class="me-2">
        {{ optionsLocal.length }}
      </v-chip>

      <v-btn size="small" variant="text" @click="addOption">
        <v-icon start>add</v-icon>
        Add
      </v-btn>
    </div>

    <div class="text-muted small mb-3">
      Drag to reorder. Click an option to expand and edit.
    </div>

    <div v-if="optionsLocal.length" class="sld-bfb-select__list">
      <draggable
        v-model="optionsLocal"
        item-key="id"
        handle=".sld-bfb-opt__drag"
        ghost-class="sld-bfb-opt--ghost"
        :animation="160"
        :delay="180"
        :delayOnTouchOnly="true"
        @end="emitOptions"
      >
        <template #item="{ element, index }">
          <div class="sld-bfb-opt" :class="{ '-open': isOpen(String(element.id)) }">
            <!-- Compact row -->
            <button
              type="button"
              class="sld-bfb-opt__head"
              @click="toggleOpen(String(element.id))"
            >
              <span class="sld-bfb-opt__drag" title="Drag to reorder" @click.stop>
                <v-icon size="18">drag_indicator</v-icon>
              </span>

              <div class="sld-bfb-opt__avatar">
                <img
                  v-if="previewImage(element)"
                  :src="previewImage(element)"
                  class="sld-bfb-opt__avatar-img"
                  alt=""
                />
                <v-icon v-else size="18">apps</v-icon>
              </div>

              <div class="sld-bfb-opt__text">
                <div class="sld-bfb-opt__title">
                  {{ String(element.title || '').trim() || `Option ${index + 1}` }}
                </div>
                <div v-if="String(element.subtitle || '').trim()" class="sld-bfb-opt__subtitle">
                  {{ String(element.subtitle || '').trim() }}
                </div>
              </div>

              <div class="sld-bfb-opt__meta">
                <v-chip
                  v-if="String(element.value || '').trim()"
                  size="x-small"
                  variant="tonal"
                  label
                  class="sld-bfb-opt__chip"
                >
                  {{ String(element.value || '').trim() }}
                </v-chip>

                <v-icon
                  size="20"
                  class="sld-bfb-opt__chev"
                  :class="{ '-rot': isOpen(String(element.id)) }"
                >
                  expand_more
                </v-icon>

                <v-btn
                  icon
                  size="x-small"
                  variant="text"
                  title="Delete"
                  :disabled="optionsLocal.length <= 1"
                  @click.stop="removeOption(String(element.id))"
                >
                  <v-icon size="18">close</v-icon>
                </v-btn>
              </div>
            </button>

            <!-- Expanded editor -->
            <v-expand-transition>
              <div v-show="isOpen(String(element.id))" class="sld-bfb-opt__body">
                <b-listing-form-builder-field-select-option
                  :model-value="element"
                  @update:modelValue="(v) => updateOption(String(element.id), v)"
                />
              </div>
            </v-expand-transition>
          </div>
        </template>
      </draggable>
    </div>

    <div v-else class="text-muted pa-3">
      No options yet. Click <b>Add</b> to create your first option.
    </div>

    <v-divider class="my-4" />

    <u-smart-toggle
      :model-value="!!fieldProxy.required"
      true-title="Required"
      false-title="Optional"
      false-gray
      @update:modelValue="(v) => patchField({ required: !!v })"
    />
  </div>
</template>

<script lang="ts">
import draggable from "vuedraggable";
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";
import BListingFormBuilderFieldSelectOption from "./BListingFormBuilderFieldSelectOption.vue";

export default {
  name: "BListingFormBuilderFieldSelect",

  components: { draggable, USmartToggle, BListingFormBuilderFieldSelectOption },

  props: {
    modelValue: { type: Object, default: null },
  },

  emits: ["update:modelValue"],

  data: () => ({
    optionsLocal: [] as any[],
    openId: null as string | null,
    _syncing: false,
  }),

  computed: {
    fieldProxy(): any {
      const src: any =
        this.modelValue && typeof this.modelValue === "object" ? this.modelValue : {};

      // Keep existing structure; do NOT force defaults into parent beyond "type"
      return {
        ...src,
        type: "select",
        variant: src.variant || "grid",
        columns: src.columns ?? 3,
        multiple: !!src.multiple,
        options: Array.isArray(src.options) ? src.options : [],
      };
    },

    variantOptions(): any[] {
      return [
        { title: "Grid", value: "grid" },
        { title: "List", value: "list" },
        { title: "Chips", value: "chips" },
      ];
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      deep: true,
      handler(v: any) {
        if (this._syncing) return;

        const opts = Array.isArray(v?.options) ? v.options : [];
        const normalized = this.normalizeOptions(opts);

        this.optionsLocal = normalized;

        // keep openId valid
        if (this.openId && !normalized.some((o: any) => String(o.id) === String(this.openId))) {
          this.openId = null;
        }
      },
    },
  },

  methods: {
    clone(obj: any) {
      try {
        return JSON.parse(JSON.stringify(obj || {}));
      } catch {
        return obj || {};
      }
    },

    makeUid(prefix = "opt") {
      try {
        // @ts-ignore
        if (globalThis.crypto?.getRandomValues) {
          // @ts-ignore
          const a = globalThis.crypto.getRandomValues(new Uint32Array(2));
          return `${prefix}_${a[0].toString(16)}${a[1].toString(16)}`;
        }
      } catch {}
      return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
    },

    toInt(v: any, fallback: number) {
      const n = parseInt(String(v ?? ""), 10);
      return Number.isFinite(n) && !Number.isNaN(n) ? n : fallback;
    },

    normalizeOne(opt: any) {
      const o: any = opt && typeof opt === "object" ? this.clone(opt) : {};
      if (!o.id) o.id = this.makeUid("opt");
      if (o.title === undefined || o.title === null) o.title = "";
      if (o.subtitle === undefined || o.subtitle === null) o.subtitle = "";
      if (o.value === undefined || o.value === null) o.value = "";
      if (o.icon === undefined || o.icon === null) o.icon = "";
      if (o.image === undefined || o.image === null) o.image = "";
      return o;
    },

    normalizeOptions(list: any): any[] {
      const arr = Array.isArray(list) ? list : [];
      const out = arr.map((x) => this.normalizeOne(x)).filter((x) => !!x?.id);

      // Ensure at least one option exists for select fields
      if (!out.length) out.push(this.normalizeOne({}));

      return out;
    },

    patchField(patch: any) {
      const next = {
        ...this.clone(this.fieldProxy),
        ...(patch || {}),
      };

      // keep select type stable
      next.type = "select";

      // if chips => multiple must be true
      if (String(next.variant || "") === "chips") next.multiple = true;

      // push optionsLocal into payload if present
      if (Array.isArray(this.optionsLocal) && this.optionsLocal.length) {
        next.options = this.normalizeOptions(this.optionsLocal);
      } else {
        next.options = this.normalizeOptions(next.options);
      }

      this._syncing = true;
      this.$emit("update:modelValue", this.clone(next));
      this._syncing = false;
    },

    emitOptions() {
      // Called after drag end / reorder
      this.optionsLocal = this.normalizeOptions(this.optionsLocal);
      this.patchField({ options: this.optionsLocal });
    },

    onVariantChange(v: any) {
      const variant = String(v || "grid");
      // if chips -> multiple forced
      if (variant === "chips") {
        this.patchField({ variant, multiple: true });
      } else {
        this.patchField({ variant });
      }
    },

    addOption() {
      const next = this.normalizeOptions(this.optionsLocal);
      const o = this.normalizeOne({});
      next.push(o);
      this.optionsLocal = next;
      this.openId = String(o.id);
      this.emitOptions();
    },

    removeOption(id: string) {
      if (this.optionsLocal.length <= 1) return;

      const next = this.normalizeOptions(this.optionsLocal).filter(
        (x: any) => String(x.id) !== String(id),
      );

      this.optionsLocal = next.length ? next : this.normalizeOptions([]);
      if (this.openId === id) this.openId = null;

      this.emitOptions();
    },

    updateOption(id: string, v: any) {
      const nextOne = this.normalizeOne(v);

      const next = this.normalizeOptions(this.optionsLocal).map((x: any) => {
        if (String(x.id) !== String(id)) return x;
        return { ...x, ...nextOne, id: x.id }; // keep id stable
      });

      this.optionsLocal = next;
      this.emitOptions();
    },

    toggleOpen(id: string) {
      this.openId = this.openId === id ? null : id;
    },

    isOpen(id: string) {
      return this.openId === id;
    },

    previewImage(opt: any): string {
      const img = String(opt?.icon || opt?.image || "").trim();
      if (!img) return "";

      if (img.startsWith("http://") || img.startsWith("https://")) return img;

      // @ts-ignore
      const fn = (this as any).getShopImagePath;
      if (typeof fn === "function") return fn(img);

      return img;
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-select {
  .gap-2 {
    gap: 8px;
  }
}

.sld-bfb-select__list {
  display: grid;
  gap: 10px;
}

/* compact option row */
.sld-bfb-opt {
  border: 1px solid rgba(20, 20, 20, 0.08);
  background: rgba(0, 0, 0, 0.012);
  border-radius: 14px;
  overflow: hidden;

  &--ghost {
    opacity: 0.6;
  }

  &__head {
    width: 100%;
    border: 0;
    background: transparent;
    padding: 10px 10px;
    cursor: pointer;

    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
  }

  &__drag {
    width: 28px;
    height: 28px;
    border-radius: 12px;
    border: 1px solid rgba(20, 20, 20, 0.10);
    background: rgba(0, 0, 0, 0.03);
    display: grid;
    place-items: center;
    cursor: grab;
    flex: 0 0 auto;
  }

  &__avatar {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(20, 20, 20, 0.08);
    display: grid;
    place-items: center;
    overflow: hidden;
    flex: 0 0 auto;
  }

  &__avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__text {
    min-width: 0;
    flex: 1 1 auto;
  }

  &__title {
    font-weight: 900;
    font-size: 13px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__subtitle {
    margin-top: 2px;
    font-size: 12px;
    opacity: 0.75;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
  }

  &__chip {
    max-width: 160px;
  }

  &__chev {
    opacity: 0.65;
    transition: transform 0.14s ease;
    &.-rot {
      transform: rotate(180deg);
    }
  }

  &__body {
    border-top: 1px solid rgba(20, 20, 20, 0.08);
    padding: 10px 10px 12px;
    background: rgba(255, 255, 255, 0.7);
  }
}
</style>