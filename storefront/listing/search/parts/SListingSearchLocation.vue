<template>
  <div class="sld-block">
    <div class="sld-label">Location</div>

    <!-- If user chose "My location", show a compact pill -->
    <div
      v-if="is_my_location"
      class="sld-my-location"
      @click="enableAddressInput"
    >
      <v-icon size="18" class="me-2">my_location</v-icon>
      <div class="sld-my-location-text">My location</div>

      <v-spacer />

      <v-btn icon variant="text" size="small" @click.stop="enableAddressInput">
        <v-icon size="18">edit</v-icon>
      </v-btn>
    </div>
    <!-- Otherwise show address input -->
    <s-listing-search-address-input
      v-else
      v-model="internal.text"
      :center="centerSafe"
      :countries="countriesSafe"
      placeholder="Enter city, area, or address..."
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

    <div class="sld-loc-row">
      <div class="sld-loc-label">
        <span>Radius</span>

        <v-tooltip location="bottom" :text="radiusHint">
          <template #activator="{ props }">
            <v-icon v-bind="props" size="16" class="sld-info"
            >info_outline</v-icon
            >
          </template>
        </v-tooltip>
      </div>

      <v-select
        v-model="internal.radius_km"
        :items="radiusOptions"
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

export default {
  name: "SListingSearchLocation",
  components: { SListingSearchAddressInput },

  inject: ["$shop"],

  props: {
    modelValue: {
      type: Object,
      default: () => ({ text: "", lat: null, lng: null, radius_km: null }),
    },
    radiusOptions: { type: Array, default: () => [] },
    radiusHint: { type: String, default: "" },
  },

  emits: ["update:modelValue", "enter"],

  data: () => ({
    internal: {
      text: "",
      lat: null as number | null,
      lng: null as number | null,
      radius_km: null as number | null,
    },

    // Prevent intermediate emits while selecting an address suggestion.
    selecting: false,

    // ✅ UI-only state (not sent to parent)
    is_my_location: false,

    // previous manual address state to restore after My location mode
    prev_address: null as any,
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
  },

  watch: {
    modelValue: {
      immediate: true,
      deep: true,
      handler(v: any) {
        this.internal = {
          text: String(v?.text || ""),
          lat: v?.lat ?? null,
          lng: v?.lng ?? null,
          radius_km: v?.radius_km ?? null,
        };
      },
    },

    internal: {
      deep: true,
      handler() {
        // While selecting a suggestion, avoid emitting intermediate values.
        if (this.selecting) return;

        // Only emit core payload
        this.$emit("update:modelValue", { ...this.internal });
      },
    },
  },

  methods: {
    extractLatLng(obj: any): { lat: number | null; lng: number | null } {
      const candidates = [
        { lat: obj?.lat, lng: obj?.lng },
        { lat: obj?.lat, lng: obj?.lon },
        { lat: obj?.lat, lng: obj?.long },
        { lat: obj?.latitude, lng: obj?.longitude },
        { lat: obj?.location?.lat, lng: obj?.location?.lng },
        { lat: obj?.location?.lat, lng: obj?.location?.lon },
        { lat: obj?.location?.latitude, lng: obj?.location?.longitude },
        { lat: obj?.center?.lat, lng: obj?.center?.lng },
        { lat: obj?.center?.lat, lng: obj?.center?.lon },
        { lat: obj?.point?.lat, lng: obj?.point?.lng },
        { lat: obj?.point?.lat, lng: obj?.point?.lon },
        { lat: obj?.position?.lat, lng: obj?.position?.lng },
        { lat: obj?.position?.lat, lng: obj?.position?.lon },
      ];

      for (const c of candidates) {
        const lat = c.lat !== undefined && c.lat !== null ? Number(c.lat) : null;
        const lng = c.lng !== undefined && c.lng !== null ? Number(c.lng) : null;

        if (
          lat !== null &&
          lng !== null &&
          Number.isFinite(lat) &&
          Number.isFinite(lng)
        ) {
          return { lat, lng };
        }
      }

      return { lat: null, lng: null };
    },

    onSelectAddress(addr: any) {
      // Selecting from suggestions updates multiple fields (text + lat/lng).
      // Block intermediate emits so parent state doesn't overwrite coordinates.
      this.selecting = true;

      // Once user selects an address => we are NOT in my-location mode
      this.is_my_location = false;

      const p = this.extractLatLng(addr);
      this.internal.lat = p.lat;
      this.internal.lng = p.lng;

      const title = String(addr?.title || "").trim();
      const address = String(addr?.address || "").trim();

      // Always sync display text to the selected suggestion.
      this.internal.text = title || address || this.internal.text;

      // Save it as the last real address
      this.prev_address = {
        text: this.internal.text,
        lat: this.internal.lat,
        lng: this.internal.lng,
      };

      // Emit once with the final payload.
      this.$nextTick(() => {
        this.$emit("update:modelValue", { ...this.internal });
        this.selecting = false;
      });
    },

    clearLocation() {
      this.is_my_location = false;
      this.prev_address = null;
      this.internal.text = "";
      this.internal.lat = null;
      this.internal.lng = null;
    },

    useMyLocation() {
      if (!navigator.geolocation) return;

      // Save current address so user can go back
      this.prev_address = {
        text: this.internal.text,
        lat: this.internal.lat,
        lng: this.internal.lng,
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos?.coords?.latitude;
          const lng = pos?.coords?.longitude;

          if (typeof lat === "number" && typeof lng === "number") {
            this.internal.lat = lat;
            this.internal.lng = lng;

            // IMPORTANT: do NOT fill the address input text (it triggers autocomplete/search)
            this.internal.text = "";

            this.is_my_location = true;
          }
        },
        () => {},
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
      );
    },

    enableAddressInput() {
      this.is_my_location = false;

      // Restore previous address if exists, otherwise keep empty
      if (this.prev_address) {
        this.internal.text = String(this.prev_address.text || "");
        this.internal.lat = this.prev_address.lat ?? null;
        this.internal.lng = this.prev_address.lng ?? null;
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
}

.sld-my-location-text {
  font-weight: 800;
  color: rgba(0, 0, 0, 0.72);
}
</style>
