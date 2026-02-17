<template>
  <div class="sld-block">
    <div class="sld-label">Location</div>

    <!-- My location pill -->
    <div v-if="is_my_location" class="sld-my-location">
      <div class="d-flex align-center min-w-0" @click="enableAddressInput">
        <v-icon size="18" class="me-2">my_location</v-icon>
        <div class="sld-my-location-text text-truncate">My location</div>
      </div>

      <v-spacer />

      <v-btn
        icon
        variant="text"
        size="small"
        title="Edit location"
        @click.stop="enableAddressInput"
      >
        <v-icon size="18">edit</v-icon>
      </v-btn>

      <v-btn
        icon
        variant="text"
        size="small"
        title="Clear location"
        @click.stop="clearLocation"
      >
        <v-icon size="18">close</v-icon>
      </v-btn>
    </div>

    <!-- Address input -->
    <s-listing-search-address-input
      v-else
      :model-value="internal.text"
      :center="centerSafe"
      :countries="countriesSafe"
      placeholder="Enter city, area, or address..."
      @update:modelValue="onTextInput"
      @select:address="onSelectAddress"
      @click:clear="clearLocation"
      @enter="$emit('enter')"
    >
      <template #append-inner>
        <v-tooltip location="bottom" text="Use my current location">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              variant="text"
              size="small"
              class="sld-icon-btn"
              @click.stop="useMyLocation"
            >
              <v-icon size="18">my_location</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </s-listing-search-address-input>

    <!-- ✅ Radius row ONLY if options exist (NO DEFAULTS HERE) -->
    <div v-if="hasRadiusOptions" class="sld-loc-row">
      <div class="sld-loc-label">
        <span>Radius</span>

        <v-tooltip v-if="radiusHint" location="bottom" :text="radiusHint">
          <template #activator="{ props }">
            <v-icon v-bind="props" size="16" class="sld-info">info_outline</v-icon>
          </template>
        </v-tooltip>
      </div>

      <v-select
        :model-value="internal.radius_km"
        @update:modelValue="onRadiusChange"
        :items="radiusOptionsSafe"
        item-title="title"
        item-value="value"
        variant="solo"
        bg-color="transparent"
        density="comfortable"
        hide-details
        flat
        class="sld-radius"
        :disabled="!hasLatLng"
        @keydown.enter.prevent="$emit('enter')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import SListingSearchAddressInput from "./SListingSearchAddressInput.vue";

type LocationModel = {
  text: string;
  lat: number | null;
  lng: number | null;
  radius_km: number | null;
};

export default {
  name: "SListingSearchLocation",
  components: { SListingSearchAddressInput },

  inject: ["$shop"],

  props: {
    modelValue: {
      type: Object,
      default: () => ({ text: "", lat: null, lng: null, radius_km: null }),
    },

    /**
     * IMPORTANT:
     * - Pass [] to hide radius dropdown in storefront.
     * - Pass list to show it.
     * Component MUST NOT inject defaults.
     */
    radiusOptions: { type: Array, default: () => [] },

    radiusHint: { type: String, default: "" },
  },

  emits: ["update:modelValue", "enter"],

  data: () => ({
    internal: {
      text: "",
      lat: null,
      lng: null,
      radius_km: null,
    } as LocationModel,

    is_my_location: false,

    _syncing_from_parent: false,
    _selecting: false,

    prev_address: null as LocationModel | null,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    hasLatLng(): boolean {
      return this.internal.lat !== null && this.internal.lng !== null;
    },

    centerSafe(): any {
      const loc = this.shop?.info?.location;
      if (
        loc &&
        typeof loc === "object" &&
        loc.lat !== undefined &&
        loc.lng !== undefined
      ) {
        return { lat: loc.lat, lng: loc.lng };
      }
      return null;
    },

    countriesSafe(): string[] | null {
      const c = this.shop?.countries;
      return Array.isArray(c) && c.length ? c : null;
    },

    radiusOptionsSafe(): any[] {
      // ✅ NO DEFAULTS, just sanitize whatever is passed in
      const list = Array.isArray((this as any).radiusOptions) ? (this as any).radiusOptions : [];
      return list
        .map((x: any) => {
          // allow both {title,value} and raw numbers
          if (x && typeof x === "object" && x.value !== undefined) return x;
          const n = parseInt(String(x), 10);
          if (!Number.isFinite(n) || Number.isNaN(n)) return null;
          return { title: `${n} km`, value: n };
        })
        .filter(Boolean);
    },

    hasRadiusOptions(): boolean {
      return Array.isArray(this.radiusOptionsSafe) && this.radiusOptionsSafe.length > 0;
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      deep: true,
      handler(v: any) {
        const next: LocationModel = {
          text: String(v?.text || ""),
          lat: this.numOrNull(v?.lat),
          lng: this.numOrNull(v?.lng),
          radius_km: this.numOrNull(v?.radius_km),
        };

        if (this.sameLocation(next, this.internal)) return;

        this._syncing_from_parent = true;

        this.internal.text = next.text;
        this.internal.lat = next.lat;
        this.internal.lng = next.lng;
        this.internal.radius_km = next.radius_km;

        this.is_my_location = !next.text && next.lat !== null && next.lng !== null;

        this._syncing_from_parent = false;
      },
    },
  },

  methods: {
    numOrNull(v: any): number | null {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    },

    sameLocation(a: LocationModel, b: LocationModel): boolean {
      return (
        String(a.text || "") === String(b.text || "") &&
        (a.lat ?? null) === (b.lat ?? null) &&
        (a.lng ?? null) === (b.lng ?? null) &&
        (a.radius_km ?? null) === (b.radius_km ?? null)
      );
    },

    emitUpdate() {
      if (this._syncing_from_parent) return;
      this.$emit("update:modelValue", { ...this.internal });
    },

    // ✅ supports GeoJSON: geometry.coordinates = [lng, lat]
    extractLatLng(obj: any): { lat: number | null; lng: number | null } {
      const coords = obj?.geometry?.coordinates;
      if (Array.isArray(coords) && coords.length >= 2) {
        const lng = Number(coords[0]);
        const lat = Number(coords[1]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
      }

      const candidates = [
        { lat: obj?.lat, lng: obj?.lng },
        { lat: obj?.lat, lng: obj?.lon },
        { lat: obj?.latitude, lng: obj?.longitude },
        { lat: obj?.location?.lat, lng: obj?.location?.lng },
        { lat: obj?.location?.lat, lng: obj?.location?.lon },
        { lat: obj?.center?.lat, lng: obj?.center?.lng },
        { lat: obj?.point?.lat, lng: obj?.point?.lng },
      ];

      for (const c of candidates) {
        const lat = c.lat !== undefined && c.lat !== null ? Number(c.lat) : null;
        const lng = c.lng !== undefined && c.lng !== null ? Number(c.lng) : null;
        if (lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng)) {
          return { lat, lng };
        }
      }

      return { lat: null, lng: null };
    },

    onSelectAddress(addr: any) {
      if (this._syncing_from_parent) return;

      this._selecting = true;
      this.is_my_location = false;

      const p = this.extractLatLng(addr);
      this.internal.lat = p.lat;
      this.internal.lng = p.lng;

      const title = String(addr?.title || "").trim();
      const address = String(addr?.address || "").trim();
      this.internal.text = title || address || this.internal.text;

      this.prev_address = { ...this.internal };

      this.$nextTick(() => {
        this.emitUpdate();
        this._selecting = false;
      });
    },

    onTextInput(val: any) {
      if (this._syncing_from_parent) return;

      const nextText = String(val || "");
      this.internal.text = nextText;

      // If user types manually, coordinates are no longer trustworthy
      if (!this._selecting && !this.is_my_location) {
        if (nextText.trim().length) {
          this.internal.lat = null;
          this.internal.lng = null;
        } else {
          this.internal.lat = null;
          this.internal.lng = null;
        }
      }

      this.emitUpdate();
    },

    onRadiusChange(val: any) {
      if (this._syncing_from_parent) return;

      const n = val !== null && val !== undefined ? parseInt(String(val), 10) : null;
      this.internal.radius_km = Number.isFinite(n as any) ? (n as any) : null;
      this.emitUpdate();
    },

    clearLocation() {
      if (this._syncing_from_parent) return;

      this.is_my_location = false;
      this.prev_address = null;

      this.internal.text = "";
      this.internal.lat = null;
      this.internal.lng = null;

      this.emitUpdate();
    },

    useMyLocation() {
      if (!navigator.geolocation) return;

      if (!this.is_my_location) {
        this.prev_address = { ...this.internal };
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos?.coords?.latitude;
          const lng = pos?.coords?.longitude;

          if (typeof lat === "number" && typeof lng === "number") {
            this.internal.lat = lat;
            this.internal.lng = lng;

            // IMPORTANT: keep text empty to avoid triggering autocomplete/search
            this.internal.text = "";

            this.is_my_location = true;

            this.emitUpdate();
          }
        },
        () => {},
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
      );
    },

    enableAddressInput() {
      this.is_my_location = false;

      if (this.prev_address && this.prev_address.text) {
        this.internal.text = this.prev_address.text;
        this.internal.lat = this.prev_address.lat;
        this.internal.lng = this.prev_address.lng;
        this.emitUpdate();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-block {
  min-width: 0;
}

.sld-label {
  font-size: 13px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.55);
  margin-bottom: 8px;
}

.sld-loc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.sld-loc-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.55);
  white-space: nowrap;
}

.sld-info {
  opacity: 0.65;
  cursor: help;
}

.sld-radius {
  min-width: 160px;
  max-width: 220px;
}

.sld-icon-btn {
  margin-right: -6px;
}

.sld-my-location {
  height: 48px;
  border: 1px solid rgba(20, 20, 20, 0.08);
  background: rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  padding: 0 12px;
  cursor: pointer;
  gap: 8px;
}

.sld-my-location-text {
  font-weight: 800;
  color: rgba(0, 0, 0, 0.72);
}
</style>
