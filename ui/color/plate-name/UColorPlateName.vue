<template>
  <div class="d-inline-flex align-center">
    <v-btn
      :variant="buttonVariant"
      :density="buttonDensity"
      :size="buttonSize"
      :disabled="disabled"
      class="text-none"
      @click="dialog = true"
    >
      <template v-if="selectedHex">
        <span class="me-2 color-dot" :style="{ background: selectedHex }"></span>
        <span class="me-2">{{ selectedHex }}</span>
      </template>
      <template v-else>
        {{ buttonText }}
      </template>

      <!-- Google Material Icons -->
      <v-icon class="ms-2" size="18">palette</v-icon>
    </v-btn>

    <v-dialog v-model="dialog" max-width="860" scrollable>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="d-flex align-center ga-2">
            <v-icon>palette</v-icon>
            <span>{{ title }}</span>
            <v-chip variant="text" size="small" class="ms-2" prepend-icon="numbers">
              {{ filteredColors.length }}
            </v-chip>
          </div>

          <v-btn icon variant="text" @click="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-2">
          <v-text-field
            v-model="q"
            :label="searchLabel"
            prepend-inner-icon="search"
            variant="outlined"
            density="comfortable"
            clearable
            hide-details
            class="mb-4"
            @keydown.enter.prevent
          />

          <div class="color-grid">
            <button
              v-for="item in filteredColors"
              :key="item.hex"
              type="button"
              class="color-item"
              @click="select(item.hex)"
              :title="item.name + ' — ' + item.hex"
            >
              <span class="swatch" :style="{ background: item.hex }"></span>
              <span class="meta">
                <span class="name">{{ item.name }}</span>
                <span class="hex">{{ item.hex }}</span>
              </span>
            </button>
          </div>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">{{ closeText }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: "UColorPlateName",

  props: {
    modelValue: { type: String, default: "" },
    disabled: { type: Boolean, default: false },

    title: { type: String, default: "Select color" },
    buttonText: { type: String, default: "Colors Plate" },
    searchLabel: { type: String, default: "Search by name or hex (e.g., khaki or #F0E68C)" },
    closeText: { type: String, default: "Close" },

    buttonVariant: { type: String, default: "text" },
    buttonDensity: { type: String, default: "comfortable" },
    buttonSize: { type: String, default: "default" },
  },

  emits: ["update:modelValue", "select"],

  data() {
    return {
      dialog: false as boolean,
      q: "" as string,
    };
  },

  computed: {
    colorsMap(): Record<string, string> {
      const map = (window as any)?.$tm?.("global.colors") || {};
      return map && typeof map === "object" ? map : {};
    },

    colorsList(): Array<{ hex: string; name: string; nameNorm: string; hexNorm: string }> {
      return Object.entries(this.colorsMap)
        .map(([hex, name]) => ({
          hex: String(hex),
          name: String(name ?? ""),
          nameNorm: String(name ?? "").toLowerCase().trim(),
          hexNorm: String(hex).toLowerCase().trim(),
        }))
        .sort((a, b) => a.nameNorm.localeCompare(b.nameNorm) || a.hexNorm.localeCompare(b.hexNorm));
    },

    filteredColors(): Array<{ hex: string; name: string }> {
      const q = (this.q || "").toLowerCase().trim();
      if (!q) return this.colorsList.map(({ hex, name }) => ({ hex, name }));

      const qHex = q.startsWith("#") ? q : "#" + q;

      return this.colorsList
        .filter((it) => it.nameNorm.includes(q) || it.hexNorm.includes(q) || it.hexNorm.includes(qHex))
        .map(({ hex, name }) => ({ hex, name }));
    },

    selectedHex(): string {
      return (this.modelValue || "").trim();
    },
  },

  watch: {
    dialog(open: boolean) {
      if (open) this.q = "";
    },
  },

  methods: {
    select(hex: string) {
      this.$emit("update:modelValue", hex);
      this.$emit("select", hex);
      this.dialog = false;
    },
  },
};
</script>

<style scoped>
.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  display: inline-block;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12) inset;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

@media (max-width: 900px) {
  .color-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .color-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.color-item {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 14px;
  padding: 10px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.08s ease, border-color 0.08s ease, box-shadow 0.08s ease;
}

.color-item:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 0, 0, 0.18);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.color-item:active {
  transform: translateY(0);
}

.swatch {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12) inset;
  flex: 0 0 auto;
}

.meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.name {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.78);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hex {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.54);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
  "Courier New", monospace;
}
</style>
