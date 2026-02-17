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
  <v-card class="sld-search-card" rounded="xl" variant="flat">
    <div class="sld-shell">
      <!-- Top row -->
      <div class="sld-row-top" :style="topGridStyle">
        <!-- Search -->
        <div v-if="textEnabled" class="sld-cell">
          <s-listing-search-text
            v-model="q_text"
            :placeholder="textPlaceholder || 'Type a name, specialty, or keyword...'"
            @enter="apply"
          />
        </div>

        <!-- Location -->
        <div v-if="locationEnabled" class="sld-cell">
          <s-listing-search-location
            v-model="q_location"
            :radius-options="radiusOptions"
            :radius-hint="locationHint"
            @enter="apply"
          />
        </div>

        <!-- Inline filters (only if allowed by smart rule) -->
        <div v-if="showInlineFilters" class="sld-cell">
          <s-listing-search-filters
            v-model="q_filters"
            :filters="inlineFilters"
            @enter="apply"
          />
        </div>

        <!-- CTA -->
        <div class="sld-cell sld-cell--cta">
          <v-btn color="black" variant="flat" class="sld-find" @click="apply">
            <v-icon start>search</v-icon>
            Find
          </v-btn>
        </div>
      </div>

      <!-- Second row: ALL filters full width -->
      <div v-if="showFiltersRow" class="sld-row-filters">
        <s-listing-search-filters
          v-model="q_filters"
          :filters="filtersSafe"
          @enter="apply"
        />
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import SListingSearchText from "./parts/SListingSearchText.vue";
import SListingSearchLocation from "./parts/SListingSearchLocation.vue";
import SListingSearchFilters from "./parts/SListingSearchFilters.vue";

type SearchFilterDef = {
  key: string;
  label?: string | null;
  type?: string | null; // select|switch|text|key_value
  multiple?: boolean | null;
  options?: string[] | null;
};

export default {
  name: "SStorefrontListingSearchBar",

  components: {
    SListingSearchText,
    SListingSearchLocation,
    SListingSearchFilters,
  },

  inject: ["$shop"],

  emits: ["apply"],

  data: () => ({
    q_text: "" as string,

    q_location: {
      text: "" as string,
      lat: null as number | null,
      lng: null as number | null,
      radius_km: null as number | null,
    },

    q_filters: {} as Record<string, any>,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    searchSettings(): any {
      const s = this.shop?.listing?.search_settings;
      return s && typeof s === "object" ? s : {};
    },

    textEnabled(): boolean {
      const v = this.searchSettings?.text?.enabled;
      return v === undefined || v === null ? true : !!v;
    },

    textPlaceholder(): string {
      const p = this.searchSettings?.text?.placeholder;
      return p ? String(p) : "";
    },

    locationEnabled(): boolean {
      return !!this.searchSettings?.location?.enabled;
    },

    filtersSafe(): SearchFilterDef[] {
      const f = this.searchSettings?.filters;
      const list = Array.isArray(f) ? f : [];

      return list
        .map((x: any) => ({
          key: String(x?.key || "").trim(),
          label: x?.label ?? null,
          type: x?.type ?? "select",
          multiple: !!x?.multiple,
          options: Array.isArray(x?.options) ? x.options : [],
        }))
        .filter((x: any) => !!x.key);
    },

    hasFilters(): boolean {
      return this.filtersSafe.length > 0;
    },

    inlineFiltersMax(): number {
      // Smart heuristic:
      // - If location is enabled => only 1 inline filter
      // - If location is disabled => up to 2 inline filters
      return this.locationEnabled ? 1 : 2;
    },

    showInlineFilters(): boolean {
      return this.hasFilters && this.filtersSafe.length <= this.inlineFiltersMax;
    },

    showFiltersRow(): boolean {
      return this.hasFilters && this.filtersSafe.length > this.inlineFiltersMax;
    },

    inlineFilters(): SearchFilterDef[] {
      return this.filtersSafe;
    },

    /**
     * ✅ IMPORTANT FIX:
     * - DO NOT inject defaults here.
     * - If options_km is [] => return [] (hide radius selector).
     * - If options_km missing/invalid => return [].
     */
    radiusOptions(): Array<{ title: string; value: number }> {
      const loc = this.searchSettings?.location || {};

      const optsRaw = loc?.options_km;

      // Only accept explicit array.
      if (!Array.isArray(optsRaw)) return [];

      // If user cleared options => keep empty.
      if (optsRaw.length === 0) return [];

      const max = loc?.max_radius_km !== null && loc?.max_radius_km !== undefined
        ? Number(loc.max_radius_km)
        : 50;

      const clean = optsRaw
        .map((x: any) => parseInt(String(x), 10))
        .filter((n: number) => Number.isFinite(n) && !Number.isNaN(n) && n > 0 && n <= max);

      const unique = Array.from(new Set(clean)).sort((a, b) => a - b);

      // If after sanitize it became empty => treat as empty (no fallback)
      if (!unique.length) return [];

      return unique.map((n) => ({ title: `${n} km`, value: n }));
    },

    locationHint(): string {
      return "Optional. Results won’t be filtered by distance until a location is set.";
    },

    topGridStyle(): any {
      const cols: string[] = [];
      if (this.textEnabled) cols.push("2fr");
      if (this.locationEnabled) cols.push("1.6fr");
      if (this.showInlineFilters) cols.push("1.6fr");
      cols.push("170px");

      return { gridTemplateColumns: cols.join(" ") };
    },
  },

  mounted() {
    // ✅ Keep radius_km usable for search, but don't force dropdown options.
    if (this.locationEnabled) {
      const def = this.searchSettings?.location?.default_radius_km;
      const n = def !== null && def !== undefined ? parseInt(String(def), 10) : null;

      // Only set if user hasn't set a radius yet.
      if ((this.q_location.radius_km === null || this.q_location.radius_km === undefined) && Number.isFinite(n as any) && (n as any) > 0) {
        this.q_location.radius_km = n as any;
      }
    }
  },

  methods: {
    normalizeType(type: any): string {
      const t = String(type ?? "select").trim().toLowerCase().replace(/-/g, "_");
      if (t === "key_value") return "key_value";
      if (t === "switch") return "switch";
      if (t === "text") return "text";
      return "select";
    },

    buildFiltersPayload(): Record<string, any> {
      const out: Record<string, any> = {};

      this.filtersSafe.forEach((f) => {
        const key = f.key;
        const v = (this.q_filters as any)[key];

        if (v === null || v === undefined) return;

        if (Array.isArray(v)) {
          const arr = v.map((x) => String(x ?? "").trim()).filter((x) => x.length);
          if (arr.length) out[key] = arr;
          return;
        }

        if (typeof v === "boolean") {
          out[key] = v;
          return;
        }

        const s = String(v ?? "").trim();
        if (s.length) out[key] = s;
      });

      return out;
    },

    apply() {
      const hasLatLng = this.q_location.lat !== null && this.q_location.lng !== null;

      this.$emit("apply", {
        search: (this.q_text || "").trim() || null,

        location: this.locationEnabled
          ? {
            text: (this.q_location.text || "").trim() || null,
            lat: this.q_location.lat,
            lng: this.q_location.lng,
            radius_km: hasLatLng
              ? parseInt(String(this.q_location.radius_km || 0), 10) || null
              : null,
          }
          : null,

        filters: this.hasFilters ? this.buildFiltersPayload() : {},
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-search-card {
  border: 1px solid rgba(20, 20, 20, 0.08);
  background: #fff;
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.06);
}

.sld-shell {
  border-radius: 18px;
  overflow: hidden;
}

.sld-row-top {
  display: grid;
  align-items: stretch;
  gap: 0;

  @media (max-width: 980px) {
    grid-template-columns: 1fr !important;
  }
}

.sld-cell {
  padding: 16px 16px 14px;
  min-width: 0;
  text-align: left;

  & + & {
    border-left: 1px solid rgba(20, 20, 20, 0.08);

    @media (max-width: 980px) {
      border-left: 0;
      border-top: 1px solid rgba(20, 20, 20, 0.08);
    }
  }
}

.sld-cell--cta {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sld-find {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  font-weight: 900;
}

.sld-row-filters {
  border-top: 1px solid rgba(20, 20, 20, 0.08);
  padding: 16px 16px 14px;
}
</style>
