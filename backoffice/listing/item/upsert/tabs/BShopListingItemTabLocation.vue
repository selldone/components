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
  <div
    :class="
      modern
        ? 'b-listing-item-tab b-listing-item-tab--modern sd-modern-widget text-start'
        : 'widget-box mb-5'
    "
  >
    <header v-if="modern" class="sd-modern-header b-listing-item-tab__header">
      <div class="sd-modern-title">
        <v-icon
          class="sd-modern-icon sd-modern-icon--plain"
          size="22"
          aria-hidden="true"
          >location_on</v-icon
        >
        <div>
          <h2 class="sd-modern-title-text">
            {{ $t("global.commons.location") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("shop_listing.item_editor.location_subtitle") }}
          </p>
        </div>
      </div>
    </header>
    <u-widget-header
      v-if="!modern"
      :title="$t('global.commons.location')"
      icon="location_on"
    />
    <v-list-subheader v-if="!modern">
      Optional address and coordinates for maps and search.
    </v-list-subheader>

    <div
      :class="
        modern ? 'sd-modern-form-grid b-listing-item-tab__fields' : undefined
      "
    >
      <u-map-address-input
        :class="
          modern
            ? 'sd-modern-underlined-field b-listing-item-tab__full'
            : undefined
        "
        :model-value="address"
        :label="$t('global.commons.address')"
        variant="underlined"
        @update:modelValue="$emit('update:address', $event)"
        prepend-icon="location_searching"
        @select:address="(it) => onSelectAddress(it)"
      ></u-map-address-input>

      <s-country-select
        :model-value="countryCode"
        :label="modern ? $t('global.commons.country') : 'Country'"
        :hint="modern ? undefined : 'ISO-3166 alpha-2, e.g. US'"
        item-value="alpha2"
        prepend-inner-icon="flag"
        :persistent-hint="!modern"
        variant="underlined"
        :class="modern ? 'sd-modern-underlined-field' : undefined"
        @update:modelValue="$emit('update:countryCode', $event)"
      />

      <v-text-field
        :model-value="city"
        :label="$t('global.commons.city')"
        variant="underlined"
        :class="modern ? 'sd-modern-underlined-field' : undefined"
        @update:modelValue="$emit('update:city', $event)"
      />

      <v-text-field
        :model-value="lat"
        :label="modern ? $t('shop_listing.item_editor.latitude') : 'Lat'"
        type="number"
        variant="underlined"
        :class="modern ? 'sd-modern-underlined-field' : undefined"
        @update:modelValue="$emit('update:lat', $event)"
      />

      <v-text-field
        :model-value="lng"
        :label="modern ? $t('shop_listing.item_editor.longitude') : 'Lng'"
        type="number"
        variant="underlined"
        :class="modern ? 'sd-modern-underlined-field' : undefined"
        @update:modelValue="$emit('update:lng', $event)"
      />

      <u-map-image
        v-if="lat && lng"
        :location="{ lat, lng }"
        :aspect-ratio="modern ? '2' : '1'"
        :class="
          modern
            ? 'b-listing-item-tab__full b-listing-item-tab__map overflow-hidden rounded-lg'
            : 'overflow-hidden rounded-18px border'
        "
        size="100%"
      ></u-map-image>
    </div>
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
    modern: { type: Boolean, default: false },
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

<style scoped>
.b-listing-item-tab--modern {
  padding: 24px;
  border: 0;
  border-radius: 16px;
  box-shadow: none;
  font-size: 14px;
  line-height: 1.6;
}
.b-listing-item-tab--modern .sd-modern-title-text {
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}
.b-listing-item-tab--modern .sd-modern-subtitle {
  margin-block-start: 5px;
  font-size: 13px;
  line-height: 21px;
}
.b-listing-item-tab__header {
  margin-block-end: 24px;
}
.b-listing-item-tab__full {
  grid-column: 1 / -1;
}
.b-listing-item-tab__map {
  width: 100%;
  margin-block-start: 12px;
}
@media (max-width: 600px) {
  .b-listing-item-tab--modern {
    padding: 18px;
  }
}
</style>
