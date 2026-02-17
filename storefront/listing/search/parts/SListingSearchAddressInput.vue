<template>
  <div class="sld-address">
    <!-- ✅ anchor -->
    <v-text-field
      ref="anchor"
      v-model="text"
      :placeholder="placeholder"
      prepend-inner-icon="place"
      variant="solo"
      bg-color="transparent"
      density="comfortable"
      hide-details
      flat
      clearable
      :loading="busy"
      @focus="onFocus"
      @blur="onBlur"
      @click:clear="onClear"
      @keydown.enter.prevent="$emit('enter')"
    >
      <template #append-inner>
        <slot name="append-inner" />
      </template>
    </v-text-field>

    <!-- ✅ menu anchored to the input -->
    <v-menu
      v-model="menu"
      :activator="anchorEl"
      :close-on-content-click="false"
      location="bottom"
      offset="6"
      :disabled="!canShowMenu"
      :open-on-click="false"
      :open-on-focus="false"
      :open-on-hover="false"
    >
      <v-list density="compact" class="sld-list" lines="two">
        <v-list-item
          v-for="(it, i) in results"
          :key="`addr_${i}`"
          class="text-start"
          @mousedown.prevent
          @click.stop="select(it)"
        >
          <v-list-item-title class="font-weight-bold">
            {{ it.title || it.address || "Address" }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-truncate">
            {{ it.address || "" }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import { throttle } from "lodash-es";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "SListingSearchAddressInput",

  inject: ["$shop"],

  props: {
    modelValue: { type: String, default: "" },
    placeholder: { type: String, default: "" },

    center: { type: Object, default: null }, // {lat,lng}
    countries: { type: Array, default: null }, // ["US",...]
  },

  emits: ["update:modelValue", "select:address", "click:clear", "enter"],

  data: () => ({
    text: "" as string,
    focused: false,
    busy: false,
    results: [] as any[],
    menu: false,

    autoComplete: true,
    selectedSnapshot: "" as string,

    anchorEl: null as HTMLElement | null,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    canShowMenu(): boolean {
      return (
        this.focused &&
        this.autoComplete &&
        Array.isArray(this.results) &&
        this.results.length > 0 &&
        !!this.anchorEl
      );
    },

    localeSafe(): string {
      // @ts-ignore
      const lang =
        typeof (this as any).getCurrentLanguage === "function"
          ? (this as any).getCurrentLanguage()
          : null;

      const l = lang?.locale ? String(lang.locale) : "";
      return l || String(navigator.language || "en").split("-")[0];
    },

    countriesSafe(): string | null {
      const c = this.countries;
      if (Array.isArray(c) && c.length) return c.join(",");
      const shopCountries = this.shop?.countries;
      if (Array.isArray(shopCountries) && shopCountries.length) return shopCountries.join(",");
      return null;
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(v: any) {
        const next = String(v || "");
        this.text = next;
        if (!this.focused) this.selectedSnapshot = next;
      },
    },

    text: throttle(function (this: any) {
      // user edited after selecting => unlock autocomplete
      if (!this.autoComplete && this.selectedSnapshot && this.text !== this.selectedSnapshot) {
        this.autoComplete = true;
      }

      this.$emit("update:modelValue", this.text);

      if (!this.focused) return;

      if (!this.text) {
        this.results = [];
        this.menu = false;
        this.autoComplete = true;
        this.selectedSnapshot = "";
        return;
      }

      if (!this.autoComplete) {
        this.results = [];
        this.menu = false;
        return;
      }

      const q = String(this.text || "").trim();
      if (q.length < 4) {
        this.results = [];
        this.menu = false;
        return;
      }

      this.fetch(q);
    }, 600),
  },

  mounted() {
    this.setAnchorEl();
  },

  updated() {
    if (!this.anchorEl) this.setAnchorEl();
  },

  methods: {
    setAnchorEl() {
      this.$nextTick(() => {
        const comp = this.$refs.anchor as any;
        const root = (comp?.$el as HTMLElement | undefined) || null;

        if (!root) {
          this.anchorEl = this.$el as HTMLElement;
          return;
        }

        const field =
          (root.querySelector(".v-field") as HTMLElement | null) ||
          (root.querySelector("input") as HTMLElement | null) ||
          root;

        this.anchorEl = field;
      });
    },

    onFocus() {
      this.focused = true;
      this.menu = this.canShowMenu;
    },

    onBlur() {
      setTimeout(() => {
        this.focused = false;
        this.menu = false;
      }, 180);
    },

    onClear() {
      this.text = "";
      this.results = [];
      this.menu = false;
      this.autoComplete = true;
      this.selectedSnapshot = "";
      this.$emit("click:clear");
    },

    safeNumber(v: any): number | null {
      const n = v !== undefined && v !== null ? Number(v) : null;
      return n !== null && Number.isFinite(n) ? n : null;
    },

    /**
     * ✅ Your API returns GeoJSON:
     * geometry.coordinates = [lng, lat]
     */
    extractLatLng(obj: any): { lat: number | null; lng: number | null } {
      const coords = obj?.geometry?.coordinates;
      if (Array.isArray(coords) && coords.length >= 2) {
        const lng = this.safeNumber(coords[0]);
        const lat = this.safeNumber(coords[1]);
        if (lat !== null && lng !== null) return { lat, lng };
      }

      // fallback shapes (if ever)
      const candidates: Array<{ lat: any; lng: any }> = [
        { lat: obj?.lat, lng: obj?.lng },
        { lat: obj?.lat, lng: obj?.lon },
        { lat: obj?.latitude, lng: obj?.longitude },
        { lat: obj?.location?.lat, lng: obj?.location?.lng },
        { lat: obj?.location?.lat, lng: obj?.location?.lon },
        { lat: obj?.center?.lat, lng: obj?.center?.lng },
      ];

      for (const c of candidates) {
        const lat = this.safeNumber(c.lat);
        const lng = this.safeNumber(c.lng);
        if (lat !== null && lng !== null) return { lat, lng };
      }

      return { lat: null, lng: null };
    },

    normalizeAddress(it: any) {
      const out: any = { ...(it || {}) };
      const { lat, lng } = this.extractLatLng(it);

      // ✅ force top-level lat/lng for parent
      out.lat = lat;
      out.lng = lng;

      return out;
    },

    fetch(q: string) {
      this.busy = true;

      axios
        .get(window.ADDRESS_API.GET_AUTOCOMPLETE(), {
          params: {
            text: q,
            lat: this.center?.lat ?? null,
            lon: this.center?.lng ?? null,
            local: this.localeSafe,
            countries: this.countriesSafe,
          },
        })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          this.results = Array.isArray(data.list) ? data.list : [];
          this.menu = this.canShowMenu;
        })
        .catch((e) => NotificationService.showLaravelError(e))
        .finally(() => (this.busy = false));
    },

    select(it: any) {
      this.autoComplete = false;

      const title = String(it?.title || "").trim();
      const address = String(it?.address || "").trim();
      const display = title || address || this.text;

      // ✅ IMPORTANT ORDER:
      // 1) emit select with lat/lng
      // 2) then update text
      const normalized = this.normalizeAddress(it);
      this.$emit("select:address", normalized);

      this.text = display;
      this.selectedSnapshot = display;
      this.$emit("update:modelValue", display);

      this.results = [];
      this.menu = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-address {
  position: relative;
}

.sld-list {
  min-width: 520px;
  max-width: 720px;

  @media (max-width: 980px) {
    min-width: 320px;
    max-width: calc(100vw - 48px);
  }
}
</style>
