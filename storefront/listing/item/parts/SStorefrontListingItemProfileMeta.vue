<template>
  <div>
    <v-card
      v-for="section in sectionsSafe"
      :key="String(section.key)"
      class="sld-prof-card mb-4"
      rounded="xl"
      variant="flat"
    >
      <v-card-text class="pa-4 pa-sm-6">
        <div class="d-flex align-center mb-2">
          <v-icon class="me-2">keyboard_arrow_down</v-icon>
          <div class="sld-prof-card__title">{{ section.title }}</div>
        </div>

        <!-- key_value list -->
        <div v-if="section.kind === 'kv_list'">
          <div v-for="(r, i) in section.value" :key="i" class="sld-prof-kv">
            <div class="sld-prof-kv__key">
              {{ r.key }}
            </div>
            <div class="sld-prof-kv__value">
              {{ r.value }}
            </div>
          </div>
        </div>

        <!-- array -->
        <div v-else-if="section.kind === 'array'" class="d-flex flex-wrap">
          <v-chip
            v-for="(x, i) in section.value"
            :key="i"
            size="small"
            label
            variant="outlined"
            class="me-2 mb-2"
          >
            {{ x }}
          </v-chip>
        </div>

        <!-- object -->
        <pre
          v-else-if="section.kind === 'object'"
          class="sld-prof-pre"
        >{{ prettyJson(section.value) }}</pre>

        <!-- text -->
        <div v-else class="sld-prof-text">
          {{ section.value }}
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingItemProfileMeta",
  props: { sections: { type: Array, default: () => [] } },

  computed: {
    sectionsSafe(): any[] {
      return Array.isArray(this.sections) ? this.sections : [];
    },
  },

  methods: {
    prettyJson(obj: any) {
      try {
        return JSON.stringify(obj, null, 2);
      } catch {
        return "-";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$sld-prof-text: 14px;

.sld-prof-card {
  background: #fff;
  border: 1px solid rgba(20, 20, 20, 0.08);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
  overflow: visible !important;

  &__title {
    font-weight: 900;
  }
}

.sld-prof-kv {
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(20, 20, 20, 0.08);
  background: rgba(0, 0, 0, 0.02);
  margin-bottom: 12px;

  &__key {
    font-weight: 900;
    margin-bottom: 8px;
    overflow-wrap: anywhere;
  }

  &__value {
    font-size: $sld-prof-text;
    color: rgba(0, 0, 0, 0.66);
    white-space: pre-wrap;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }
}

.sld-prof-text {
  font-size: $sld-prof-text;
  color: rgba(0, 0, 0, 0.66);
  white-space: pre-wrap;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.sld-prof-pre {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.62);
  white-space: pre-wrap;
  line-height: 1.6;
  margin: 0;
}
</style>
