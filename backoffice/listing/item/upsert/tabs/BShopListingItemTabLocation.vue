<!--
  - Copyright (c) 2026. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template>
  <div class="widget-box mb-5">
    <u-widget-header
      :title="$t('global.commons.location')"
      icon="location_on"
    />
    <v-list-subheader>
      Optional address and coordinates for maps and search.
    </v-list-subheader>

    <u-map-address-input
      :model-value="address"
      :label="$t('global.commons.address')"
      variant="underlined"
      @update:modelValue="$emit('update:address', $event)"
      prepend-icon="location_searching"
      @select:address="(it) => onSelectAddress(it)"
    ></u-map-address-input>

    <s-country-select
      :model-value="countryCode"
      label="Country"
      hint="ISO-3166 alpha-2, e.g. US"
      item-value="alpha2"
      prepend-inner-icon="flag"
      persistent-hint
      variant="underlined"
      @update:modelValue="$emit('update:countryCode', $event)"
    />

    <v-text-field
      :model-value="city"
      :label="$t('global.commons.city')"
      variant="underlined"
      @update:modelValue="$emit('update:city', $event)"
    />

    <v-text-field
      :model-value="lat"
      label="Lat"
      type="number"
      variant="underlined"
      @update:modelValue="$emit('update:lat', $event)"
    />

    <v-text-field
      :model-value="lng"
      label="Lng"
      type="number"
      variant="underlined"
      @update:modelValue="$emit('update:lng', $event)"
    />

    <u-map-image
v-if="lat && lng"
                 :location="{ lat, lng }"
                 aspect-ratio="1"
                 class="overflow-hidden rounded-18px border"
                 size="100%"

    ></u-map-image>
  </div>
</template>

<script lang="ts">
import SCountrySelect from "@selldone/components-vue/ui/country/select/SCountrySelect.vue";
import UMapAddressInput from "@selldone/components-vue/ui/map/address/input/UMapAddressInput.vue";
import UMapView from "@selldone/components-vue/ui/map/view/UMapView.vue";
import UMapImage from "@selldone/components-vue/ui/map/image/UMapImage.vue";

export default {
  name: "BShopListingItemTabLocation",
  components: { UMapImage, UMapView, UMapAddressInput, SCountrySelect },

  props: {
    countryCode: { type: String, default: "" },
    city: { type: String, default: "" },
    address: { type: String, default: "" },
    lat: { default: null },
    lng: { default: null },
  },

  emits: [
    "update:countryCode",
    "update:city",
    "update:address",
    "update:lat",
    "update:lng",
  ],

  methods: {
    onSelectAddress(item) {
      //  console.log("onSelectAddress", item);
      if (item.geometry && item.geometry.type === "Point") {
        this.$emit("update:lat", item.geometry.coordinates[1]);
        this.$emit("update:lng", item.geometry.coordinates[0]);

        if (item.country && !this.countryCode) {
          this.$emit("update:countryCode", item.country);
        }
        if (item.country && !this.city) {
          this.$emit("update:city", item.city || "");
        }
      }
    },
  },
};
</script>

<style scoped></style>
