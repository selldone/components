<!--
  Selldone® Business OS™
  Storefront Listing Onboarding - Select Field (Airbnb-like)

  - Pure HTML layout inside options (no v-list / v-card / v-item-group)
  - Symmetric padding (icon top, text bottom)
  - Compact height
  - Single selection: clicking another option replaces previous (no “stuck on first”)
  - Multiple selection: toggle independently
  - Preview: allows visual selection, but does NOT emit to parent
  - Uses ONE image field per option (image), icon is fallback
-->

<template>
  <div class="sld-onb-select" :class="{ '-preview': !!preview }">
    <!-- Field title -->
    <div v-if="fieldTitle" class="sld-onb-select__title">
      {{ fieldTitle }}
    </div>

    <!-- Field hint (optional) -->
    <div v-if="fieldHint" class="sld-onb-select__hint">
      {{ fieldHint }}
    </div>

    <div class="sld-onb-select__wrap" :class="[`-variant-${variantSafe}`]" :style="gridStyle">
      <!-- GRID -->
      <template v-if="variantSafe === 'grid'">
        <button
          v-for="opt in optionsSafe"
          :key="opt._key"
          type="button"
          class="sld-onb-opt -grid"
          :class="{ '-selected': isSelected(opt._val) }"
          :aria-pressed="String(isSelected(opt._val))"
          @click="onToggle(opt._val)"
        >
          <div class="sld-onb-opt__grid-inner">
            <!-- top: icon -->
            <div class="sld-onb-opt__icon">
              <img
                v-if="opt._img"
                :src="opt._img"
                alt=""
                class="sld-onb-opt__img"
                loading="lazy"
              />
              <v-icon v-else size="24" class="text-muted">category</v-icon>
            </div>

            <!-- bottom: texts -->
            <div class="sld-onb-opt__texts">
              <div class="sld-onb-opt__t">
                {{ opt.title }}
              </div>
              <div v-if="opt.subtitle" class="sld-onb-opt__st">
                {{ opt.subtitle }}
              </div>
            </div>
          </div>
        </button>
      </template>

      <!-- LIST -->
      <template v-else-if="variantSafe === 'list'">
        <button
          v-for="opt in optionsSafe"
          :key="opt._key"
          type="button"
          class="sld-onb-opt -list"
          :class="{ '-selected': isSelected(opt._val) }"
          :aria-pressed="String(isSelected(opt._val))"
          @click="onToggle(opt._val)"
        >
          <div class="sld-onb-opt__list-left">
            <div class="sld-onb-opt__t">{{ opt.title }}</div>
            <div v-if="opt.subtitle" class="sld-onb-opt__st">{{ opt.subtitle }}</div>
          </div>

          <div class="sld-onb-opt__list-right">
            <img
              v-if="opt._img"
              :src="opt._img"
              alt=""
              class="sld-onb-opt__img -small"
              loading="lazy"
            />
            <v-icon v-else size="20" class="text-muted">chevron_right</v-icon>
          </div>
        </button>
      </template>

      <!-- CHIPS -->
      <template v-else>
        <button
          v-for="opt in optionsSafe"
          :key="opt._key"
          type="button"
          class="sld-onb-opt -chip"
          :class="{ '-selected': isSelected(opt._val) }"
          :aria-pressed="String(isSelected(opt._val))"
          @click="onToggle(opt._val)"
        >
          <img
            v-if="opt._img"
            :src="opt._img"
            alt=""
            class="sld-onb-opt__img -chip"
            loading="lazy"
          />
          <span class="sld-onb-opt__chip-text">{{ opt.title }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
type SafeOpt = {
  _key: string;
  _val: string;
  _img: string;
  title: string;
  subtitle: string;
};

export default {
  name: "SStorefrontListingOnboardingFieldSelect",

  props: {
    field: { type: Object, required: true },
    modelValue: { default: null },
    preview: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  data: () => ({
    // Internal state to avoid “stuck” UI when parent updates are delayed
    localValue: null as any, // string | string[] | null
    _syncing: false,
  }),

  computed: {
    fieldSafe(): any {
      const f: any = this.field && typeof this.field === "object" ? this.field : {};
      return {
        title: String(f.title || "").trim(),
        hint: String(f.hint || f.subtitle || "").trim(),
        required: !!f.required,
        multiple: !!f.multiple,
        variant: String(f.variant || "grid").trim(), // grid | list | chips
        columns: this.toInt(f.columns, 3),
        options: Array.isArray(f.options) ? f.options : [],
      };
    },

    fieldTitle(): string {
      return this.fieldSafe.title;
    },

    fieldHint(): string {
      return this.fieldSafe.hint;
    },

    multiple(): boolean {
      return !!this.fieldSafe.multiple;
    },

    variantSafe(): string {
      const v = String(this.fieldSafe.variant || "grid").toLowerCase();
      if (v === "list" || v === "chips") return v;
      return "grid";
    },

    columnsSafe(): number {
      const n = this.toInt(this.fieldSafe.columns, 3);
      return Math.max(2, Math.min(4, n));
    },

    gridStyle(): any {
      if (this.variantSafe !== "grid") return {};
      return { "--cols": String(this.columnsSafe) };
    },

    optionsSafe(): SafeOpt[] {
      const arr = Array.isArray(this.fieldSafe.options) ? this.fieldSafe.options : [];

      return arr
        .map((raw: any, idx: number) => {
          const o: any = raw && typeof raw === "object" ? raw : {};

          const id = String(o.id || `opt_${idx}`);
          const title = String(o.title || "").trim() || `Option ${idx + 1}`;
          const subtitle = String(o.subtitle || o.description || "").trim();

          const valueRaw = this.optionValue(o, title, id);

          // ONE image field: image (icon is fallback)
          const imgRaw = String(o.image || o.icon || "").trim();
          const img = this.resolveImage(imgRaw);

          return {
            _key: id,
            _val: valueRaw,
            _img: img,
            title,
            subtitle,
          };
        })
        .filter((x: SafeOpt) => !!x._val);
    },

    selectedSet(): Set<string> {
      // Use internal value for instant UI response
      const v = this.localValue;

      if (this.multiple) {
        const arr = Array.isArray(v)
          ? v
          : (v !== null && v !== undefined && String(v).trim() !== "" ? [v] : []);
        return new Set(arr.map((x: any) => String(x)));
      }

      // single
      const one = Array.isArray(v) ? (v.length ? String(v[0]) : "") : (v !== null && v !== undefined ? String(v) : "");
      return new Set(one && one.trim() !== "" ? [one] : []);
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(v: any) {
        this._syncing = true;
        this.localValue = this.normalizeIncoming(v);
        this._syncing = false;
      },
    },

    // if multiple flag changes, normalize the local value accordingly
    "fieldSafe.multiple": {
      handler() {
        this._syncing = true;
        this.localValue = this.normalizeIncoming(this.localValue);
        this._syncing = false;
      },
    },
  },

  methods: {
    toInt(v: any, fallback: number) {
      const n = parseInt(String(v ?? ""), 10);
      return Number.isFinite(n) && !Number.isNaN(n) ? n : fallback;
    },

    normalizeIncoming(v: any) {
      if (this.multiple) {
        if (Array.isArray(v)) return v.map((x: any) => String(x));
        if (v === null || v === undefined || String(v).trim() === "") return [];
        return [String(v)];
      }

      // single
      if (Array.isArray(v)) return v.length ? String(v[0]) : null;
      if (v === null || v === undefined || String(v).trim() === "") return null;
      return String(v);
    },

    optionValue(o: any, title: string, id: string): string {
      const vv = String(o?.value ?? "").trim();
      if (vv) return vv;

      const tt = String(title || "").trim();
      if (tt) return tt;

      return String(id || "").trim() || `opt_${Math.random().toString(16).slice(2)}`;
    },

    resolveImage(img: string): string {
      const s = String(img || "").trim();
      if (!s) return "";
      if (s.startsWith("http://") || s.startsWith("https://")) return s;

      // @ts-ignore
      const fn = (this as any).getShopImagePath;
      if (typeof fn === "function") return fn(s);

      return s;
    },

    isSelected(val: string): boolean {
      return this.selectedSet.has(String(val ?? ""));
    },

    emitValue(next: any) {
      // Preview: allow visual selection but do not emit to parent
      if (this.preview) return;
      this.$emit("update:modelValue", next);
    },

    onToggle(val: string) {
      const key = String(val ?? "").trim();
      if (!key) return;

      // MULTIPLE
      if (this.multiple) {
        const cur = Array.from(this.selectedSet);
        const i = cur.indexOf(key);

        if (i >= 0) cur.splice(i, 1);
        else cur.push(key);

        this.localValue = cur;     // instant UI update
        this.emitValue(cur);       // persist
        return;
      }

      // SINGLE
      const current = Array.from(this.selectedSet)[0] || "";

      if (current !== key) {
        // select new, replace old
        this.localValue = key;
        this.emitValue(key);
        return;
      }

      // clicked same again: toggle off only if not required
      if (this.fieldSafe.required) {
        this.localValue = key;
        this.emitValue(key);
      } else {
        this.localValue = null;
        this.emitValue(null);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/* Compact but symmetric Airbnb-like spacing */
.sld-onb-select {
  &.-preview {
    opacity: 0.98;
  }

  &__title {
    font-weight: 900;
    font-size: 16px;
    margin-bottom: 10px;
  }

  &__hint {
    margin-top: -6px;
    margin-bottom: 10px;
    font-size: 13px;
    opacity: 0.72;
    line-height: 1.45;
  }

  &__wrap.-variant-grid {
    display: grid;
    gap: 10px; /* tighter */
    grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
  }

  &__wrap.-variant-list {
    display: grid;
    gap: 10px;
  }

  &__wrap.-variant-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
}

.sld-onb-opt {
  appearance: none;
  border: 1px solid rgba(0, 0, 0, 0.14);
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.12s ease, background 0.12s ease, transform 0.12s ease;

  &:hover {
    border-color: rgba(0, 0, 0, 0.22);
    background: rgba(0, 0, 0, 0.012);
  }

  &.-selected {
    border: 3px solid #000;
    background: rgba(0, 0, 0, 0.02);
  }

  /* GRID */
  &.-grid {
    padding: 12px 14px; /* ✅ symmetric + compact */
    min-height: 78px;   /* ✅ compact */
  }

  &__grid-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* icon top, text bottom */
    align-items: flex-start;
    min-width: 0;
  }

  &__icon {
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
  }

  &__img {
    width: 28px;
    height: 28px;
    object-fit: contain;
    display: block;

    &.-small {
      width: 24px;
      height: 24px;
    }

    &.-chip {
      width: 18px;
      height: 18px;
      margin-right: 6px;
    }
  }

  &__texts {
    min-width: 0;
    width: 100%;
  }

  &__t {
    font-weight: 900;
    font-size: 14px;
    line-height: 1.18;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__st {
    margin-top: 4px;
    font-size: 12px;
    opacity: 0.74;
    line-height: 1.25;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* LIST */
  &.-list {
    padding: 12px 14px; /* compact */
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__list-left {
    min-width: 0;
    flex: 1 1 auto;
  }

  &__list-right {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  /* CHIPS */
  &.-chip {
    padding: 9px 12px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  &__chip-text {
    font-weight: 800;
    font-size: 13px;
    line-height: 1;
  }
}

@media (max-width: 900px) {
  .sld-onb-select__wrap.-variant-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>