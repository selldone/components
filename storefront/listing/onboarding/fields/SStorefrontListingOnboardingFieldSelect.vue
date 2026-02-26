<template>
  <div class="sld-onb-field">
    <!-- Chips variant -->
    <div v-if="variant === 'chips'">
      <v-chip-group
        :model-value="chipValue"
        multiple
        selected-class="-selected"
        class="sld-onb-chips"
        @update:modelValue="onUpdateChips"
      >
        <v-chip
          v-for="opt in options"
          :key="opt.id"
          :value="optValue(opt)"
          variant="outlined"
          label
          class="sld-onb-chip"
        >
          <v-avatar v-if="opt.image" start size="18">
            <img :src="optImageUrl(opt.image)" alt="" />
          </v-avatar>
          <v-icon v-else-if="opt.icon" start size="18">{{ opt.icon }}</v-icon>
          {{ opt.title || 'Option' }}
        </v-chip>
      </v-chip-group>
    </div>

    <!-- List variant -->
    <div v-else-if="variant === 'list'">
      <v-item-group
        :model-value="listValue"
        :multiple="multiple"
        @update:modelValue="onUpdateList"
      >
        <v-list class="sld-onb-list" density="comfortable" nav>
          <v-item v-for="opt in options" :key="opt.id" :value="optValue(opt)" v-slot="{ isSelected, toggle }">
            <v-list-item
              :active="isSelected"
              rounded="lg"
              class="sld-onb-list-item"
              @click="toggle"
            >
              <template #prepend>
                <v-avatar v-if="opt.image" size="28" rounded="lg">
                  <img :src="optImageUrl(opt.image)" alt="" />
                </v-avatar>
                <v-icon v-else-if="opt.icon" size="22">{{ opt.icon }}</v-icon>
                <v-icon v-else size="22" class="opacity-30">radio_button_unchecked</v-icon>
              </template>

              <v-list-item-title class="font-weight-bold">
                {{ opt.title || 'Option' }}
              </v-list-item-title>

              <v-list-item-subtitle v-if="opt.subtitle">
                {{ opt.subtitle }}
              </v-list-item-subtitle>

              <template #append>
                <v-icon v-if="isSelected" class="text-success">check_circle</v-icon>
              </template>
            </v-list-item>
          </v-item>
        </v-list>
      </v-item-group>
    </div>

    <!-- Grid variant (default) -->
    <div v-else>
      <v-item-group
        :model-value="gridValue"
        :multiple="multiple"
        @update:modelValue="onUpdateGrid"
      >
        <v-row dense>
          <v-col v-for="opt in options" :key="opt.id" :cols="gridCols">
            <v-item :value="optValue(opt)" v-slot="{ isSelected, toggle }">
              <v-card
                class="sld-onb-card"
                :class="{ '-selected': isSelected }"
                rounded="lg"
                variant="outlined"
                @click="toggle"
              >
                <v-card-text class="d-flex align-center" style="gap: 10px">
                  <v-avatar v-if="opt.image" size="34" rounded="lg">
                    <img :src="optImageUrl(opt.image)" alt="" />
                  </v-avatar>
                  <v-icon v-else-if="opt.icon" size="26">{{ opt.icon }}</v-icon>
                  <v-icon v-else size="26" class="opacity-30">check_box_outline_blank</v-icon>

                  <div class="min-width-0">
                    <div class="font-weight-bold text-truncate">
                      {{ opt.title || 'Option' }}
                    </div>
                    <div v-if="opt.subtitle" class="text-muted text-truncate" style="font-size: 12px">
                      {{ opt.subtitle }}
                    </div>
                  </div>

                  <v-spacer />
                  <v-icon v-if="isSelected" class="text-success">check_circle</v-icon>
                </v-card-text>
              </v-card>
            </v-item>
          </v-col>
        </v-row>
      </v-item-group>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingOnboardingFieldSelect",

  props: {
    field: { type: Object, required: true },
    modelValue: { default: null },
    preview: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  computed: {
    options(): any[] {
      return Array.isArray(this.field?.options) ? this.field.options : [];
    },

    variant(): string {
      const v = String(this.field?.variant || "grid");
      return ["grid", "list", "chips"].includes(v) ? v : "grid";
    },

    multiple(): boolean {
      if (this.variant === "chips") return true;
      return !!this.field?.multiple;
    },

    gridCols(): number {
      const columns = parseInt(String(this.field?.columns ?? 3), 10);
      const c = Number.isFinite(columns) && columns > 0 ? columns : 3;
      const cols = Math.floor(12 / Math.min(Math.max(c, 1), 6));
      return Math.min(Math.max(cols, 2), 12);
    },

    gridValue(): any {
      return this.normalizeValue(this.modelValue);
    },

    listValue(): any {
      return this.normalizeValue(this.modelValue);
    },

    chipValue(): any[] {
      const v = this.normalizeValue(this.modelValue);
      return Array.isArray(v) ? v : v ? [v] : [];
    },
  },

  methods: {
    optValue(opt: any): any {
      const v = opt?.value;
      if (v !== null && v !== undefined && String(v).trim() !== "") return v;
      return opt?.id;
    },

    normalizeValue(v: any) {
      if (this.multiple) {
        return Array.isArray(v) ? v : v === null || v === undefined || v === "" ? [] : [v];
      }
      return v === undefined ? null : v;
    },

    optImageUrl(path: string): string {
      const p = String(path || "").trim();
      if (!p) return "";
      if (p.startsWith("http://") || p.startsWith("https://")) return p;
      // @ts-ignore
      const fn = (this as any).getShopImagePath;
      if (typeof fn === "function") return fn(p);
      return p;
    },

    onUpdateGrid(v: any) {
      this.$emit("update:modelValue", this.multiple ? (Array.isArray(v) ? v : []) : v);
    },

    onUpdateList(v: any) {
      this.$emit("update:modelValue", this.multiple ? (Array.isArray(v) ? v : []) : v);
    },

    onUpdateChips(v: any) {
      this.$emit("update:modelValue", Array.isArray(v) ? v : []);
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-onb-field {
  width: 100%;
}

.sld-onb-card {
  cursor: pointer;
  border-color: rgba(0, 0, 0, 0.12);
  transition: all 0.15s ease-in-out;

  &.-selected {
    border-color: rgba(0, 0, 0, 0.8);
  }

  &:hover {
    border-color: rgba(0, 0, 0, 0.45);
  }
}

.sld-onb-list {
  background: transparent;
}

.sld-onb-list-item {
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}

.sld-onb-chips {
  flex-wrap: wrap;
  gap: 10px;
}

.sld-onb-chip {
  cursor: pointer;
}
</style>
