<!--
  Storefront Listing Onboarding
  Field: Select (grid / list / chips)
  Airbnb-like compact grid cards + thick black border on selected.
-->

<template>
  <div class="sld-onb-field">
    <!-- Field title -->
    <div v-if="title" class="sld-onb-field__title">
      {{ title }}
    </div>

    <!-- GRID (Airbnb-like) -->
    <div v-if="variant === 'grid'">
      <v-item-group
        :model-value="selectedValue"
        :multiple="multiple"
        @update:modelValue="onUpdateGrid"
      >
        <v-container class="pa-0">
          <v-row class="sld-onb-grid" dense>
            <v-col
              v-for="o in options"
              :key="toKey(o)"
              cols="12"
              sm="6"
              :md="colMd"
              :lg="colLg"
            >
              <v-item v-slot="{ isSelected, toggle }" :value="toValue(o)">
                <v-card
                  variant="flat"
                  class="sld-onb-opt"
                  :class="{ '-selected': isSelected }"
                  role="button"
                  tabindex="0"
                  @click="toggle()"
                  @keydown.enter.prevent="toggle()"
                  @keydown.space.prevent="toggle()"
                >
                  <div class="sld-onb-opt__icon">
                    <img
                      v-if="optIconUrl(o)"
                      :src="optIconUrl(o)"
                      class="sld-onb-opt__img"
                      alt=""
                    />
                    <v-icon v-else-if="optIconName(o)" size="28">
                      {{ optIconName(o) }}
                    </v-icon>
                    <v-icon v-else size="28" class="op-0-6">check_box_outline_blank</v-icon>
                  </div>

                  <div class="sld-onb-opt__texts">
                    <div class="sld-onb-opt__title">
                      {{ o.title || o.value }}
                    </div>
                    <div v-if="o.subtitle" class="sld-onb-opt__subtitle">
                      {{ o.subtitle }}
                    </div>
                  </div>
                </v-card>
              </v-item>
            </v-col>
          </v-row>
        </v-container>
      </v-item-group>
    </div>

    <!-- LIST -->
    <div v-else-if="variant === 'list'">
      <v-item-group
        :model-value="selectedValue"
        :multiple="multiple"
        @update:modelValue="onUpdateGrid"
      >
        <v-list density="comfortable" class="sld-onb-list" lines="two">
          <v-item
            v-for="o in options"
            :key="toKey(o)"
            v-slot="{ isSelected, toggle }"
            :value="toValue(o)"
          >
            <v-list-item
              class="sld-onb-list__item"
              :class="{ '-selected': isSelected }"
              @click="toggle()"
            >
              <template #prepend>
                <v-avatar v-if="optIconUrl(o)" size="34" class="rounded-lg">
                  <img :src="optIconUrl(o)" alt="" />
                </v-avatar>
                <v-icon v-else-if="optIconName(o)" size="20">{{ optIconName(o) }}</v-icon>
                <v-icon v-else size="20" class="op-0-6">radio_button_unchecked</v-icon>
              </template>

              <v-list-item-title class="font-weight-black">
                {{ o.title || o.value }}
              </v-list-item-title>

              <v-list-item-subtitle v-if="o.subtitle">
                {{ o.subtitle }}
              </v-list-item-subtitle>

              <template #append>
                <v-icon v-if="isSelected">check</v-icon>
              </template>
            </v-list-item>
          </v-item>
        </v-list>
      </v-item-group>
    </div>

    <!-- CHIPS -->
    <div v-else class="sld-onb-chips">
      <v-chip-group
        :model-value="selectedValue"
        :multiple="multiple"
        column
        @update:modelValue="onUpdateGrid"
      >
        <v-chip
          v-for="o in options"
          :key="toKey(o)"
          :value="toValue(o)"
          label
          size="large"
          class="sld-onb-chip"
        >
          <v-icon v-if="optIconName(o)" start>{{ optIconName(o) }}</v-icon>
          {{ o.title || o.value }}
        </v-chip>
      </v-chip-group>
    </div>
  </div>
</template>

<script lang="ts">
type OptionDef = {
  id?: string | number;
  value?: any;
  title?: string;
  subtitle?: string;
  icon?: string;
  image?: string;
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
    previewValue: null as any,
  }),

  computed: {
    title(): string {
      return String((this as any).field?.title || "").trim();
    },

    multiple(): boolean {
      return !!(this as any).field?.multiple;
    },

    variant(): "grid" | "list" | "chips" {
      const v = String((this as any).field?.variant || "grid").toLowerCase();
      if (v === "list") return "list";
      if (v === "chips") return "chips";
      return "grid";
    },

    options(): OptionDef[] {
      const raw = (this as any).field?.options;
      const list = Array.isArray(raw) ? raw : [];
      return list.map((x: any) =>
        x && typeof x === "object" ? x : { title: String(x), value: x },
      );
    },

    columns(): number {
      const n = parseInt(String((this as any).field?.columns ?? 3), 10);
      return Math.max(1, Math.min(4, Number.isFinite(n) ? n : 3));
    },

    colMd(): number {
      const cols = this.columns;
      if (cols === 1) return 12;
      if (cols === 2) return 6;
      if (cols === 3) return 4;
      return 3;
    },

    colLg(): number {
      return this.colMd;
    },

    selectedValue(): any {
      const v = (this as any).preview ? (this as any).previewValue : (this as any).modelValue;

      if ((this as any).multiple) {
        return Array.isArray(v) ? v : (v !== null && v !== undefined ? [v] : []);
      }

      // ✅ single select: if someone passed array by mistake, keep last/first
      if (Array.isArray(v)) return v.length ? v[v.length - 1] : null;

      return v ?? null;
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(v: any) {
        if (!(this as any).preview) return;
        (this as any).previewValue = v;
      },
    },
  },

  methods: {
    looksLikeImagePath(v: any): boolean {
      const s = String(v || "").trim();
      if (!s) return false;
      if (s.startsWith("http://") || s.startsWith("https://")) return true;
      if (s.startsWith("shops_")) return true;
      if (/\.(png|jpe?g|webp|svg)$/i.test(s)) return true;
      if (s.includes("/")) return true;
      return false;
    },

    resolveImage(v: any): string {
      const s = String(v || "").trim();
      if (!s) return "";
      if (s.startsWith("http://") || s.startsWith("https://")) return s;

      // @ts-ignore
      const fn = (this as any).getShopImagePath;
      if (typeof fn === "function") return fn(s);
      return s;
    },

    optIconUrl(o: OptionDef): string {
      const img = String(o?.image || "").trim();
      if (img) return this.resolveImage(img);

      const icon = String(o?.icon || "").trim();
      if (this.looksLikeImagePath(icon)) return this.resolveImage(icon);

      return "";
    },

    optIconName(o: OptionDef): string {
      const icon = String(o?.icon || "").trim();
      if (!icon) return "";
      if (this.looksLikeImagePath(icon)) return "";
      return icon;
    },

    toValue(o: OptionDef) {
      if (o && Object.prototype.hasOwnProperty.call(o, "value")) return (o as any).value;
      return (o as any).id ?? (o as any).title ?? null;
    },

    toKey(o: OptionDef): string {
      const k = (o as any).id ?? (o as any).value ?? (o as any).title ?? "";
      return String(k);
    },

    emitValue(v: any) {
      if ((this as any).preview) {
        (this as any).previewValue = v;
        return;
      }
      (this as any).$emit("update:modelValue", v);
    },

    onUpdateGrid(v: any) {
      if ((this as any).multiple) {
        const arr = Array.isArray(v) ? v : (v !== null && v !== undefined ? [v] : []);
        this.emitValue(arr);
        return;
      }

      // ✅ single select: always keep a single scalar
      const scalar = Array.isArray(v) ? (v.length ? v[v.length - 1] : null) : (v ?? null);
      this.emitValue(scalar);
    },
  },
};
</script>

<style lang="scss" scoped>
$sld-opt-radius: 14px;
$sld-opt-border: rgba(0, 0, 0, 0.14);
$sld-opt-border-hover: rgba(0, 0, 0, 0.26);
$sld-opt-selected: rgba(0, 0, 0, 0.92);

.sld-onb-field__title {
  font-size: 22px;
  font-weight: 900;
  margin-bottom: 12px;
}

.sld-onb-grid {
  margin: 0;
}

/* ✅ More compact Airbnb-like card */
.sld-onb-opt {
  min-height: 92px; /* was taller */
  border-radius: $sld-opt-radius;
  border: 1px solid $sld-opt-border;
  background: #fff;

  padding: 12px 14px; /* tighter */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  cursor: pointer;
  user-select: none;

  transition: border-color 0.12s ease, background 0.12s ease, box-shadow 0.12s ease;

  &:hover {
    border-color: $sld-opt-border-hover;
    background: rgba(0, 0, 0, 0.012);
  }

  &.-selected {
    /* thick black border without layout shift */
    box-shadow: inset 0 0 0 3px $sld-opt-selected;
    border-color: rgba(0, 0, 0, 0.22);
    background: rgba(0, 0, 0, 0.018);
  }
}

.sld-onb-opt__icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 10px; /* tighter */
}

.sld-onb-opt__img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  display: block;
}

.sld-onb-opt__texts {
  min-width: 0;
}

.sld-onb-opt__title {
  font-weight: 900;
  font-size: 15px;
  line-height: 1.15;
}

.sld-onb-opt__subtitle {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.78;
  line-height: 1.35;

  max-height: 2.7em;
  overflow: hidden;
}

/* List styles */
.sld-onb-list {
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.10);
  overflow: hidden;
}

.sld-onb-list__item.-selected {
  background: rgba(0, 0, 0, 0.02);
}

/* Chips */
.sld-onb-chips {
  margin-top: 6px;
}

.sld-onb-chip {
  border: 1px solid rgba(0, 0, 0, 0.16);
}

@media (max-width: 900px) {
  .sld-onb-field__title {
    font-size: 18px;
  }

  .sld-onb-opt {
    min-height: 86px;
    padding: 11px 12px;
  }
}
</style>