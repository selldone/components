<!--
  - Copyright (c) 2023. Selldone® Business OS™
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
  <div class="s--shop-buyer-receiver-info-widget" :class="{ dark: dark }">
    <p class="text-start-dir">
      <i class="fas fa-truck me-1" />
      {{ $t("global.receiver_info.address") }}
      :

      <flag
        v-if="receiverInfo.country"
        :iso="receiverInfo.country"
        :squared="false"
        class="mx-1"
      />
      <country-list
        v-else
        v-model="receiverInfo.country"
        item-value="alpha2"
        required
        label="Select your country"
        filled
        rounded
        class="max-width-field-mini"
        @change="(val) => $emit('update:country', val)"
      ></country-list>

      <span class="field-value" @click.stop="$emit('show:map')">
        {{
          receiverInfo.address
            ? generateFullAddress(receiverInfo)
            : $t("global.receiver_info.enter_value")
        }}
      </span>
    </p>

    <p v-if="has_postcode">
      {{ $t("global.receiver_info.postcode") }}
      :
      <span class="field-value" @click.stop="$emit('show:detail')">
        {{
          receiverInfo.postal ? receiverInfo.postal : $t("global.commons.empty")
        }}
      </span>
      <span v-if="!receiverInfo.postal" class="ms-4 red--text text-lowercase">
        <v-icon small color="red" class="me-1 blink-me"
          >fas fa-exclamation-circle</v-icon
        >
        {{ $t("global.commons.mandatory") }}!
      </span>
    </p>

    <p>
      {{ $t("global.receiver_info.tel") }}
      :
      <span class="field-value" @click.stop="$emit('show:detail')">
        {{
          receiverInfo.phone
            ? `${receiverInfo.phone}`
            : $t("global.receiver_info.enter_value")
        }}
        {{ receiverInfo.full_name }}
      </span>

      <span v-if="!receiverInfo.phone" class="ms-4 red--text text-lowercase">
        <v-icon small color="red" class="me-1 blink-me"
          >fas fa-exclamation-circle</v-icon
        >
        {{ $t("global.commons.mandatory") }}!
      </span>
    </p>

    <p>
      {{ $t("global.receiver_info.address_note") }}
      :
      <span class="field-value" @click.stop="$emit('show:detail')">
        {{
          receiverInfo.message
            ? receiverInfo.message
            : $t("global.commons.empty")
        }}
      </span>
    </p>

    <v-img
      v-if="!noMap"
      @click="$emit('show:map')"
      width="100%"
      :max-width=" receiverInfo.location?640:64"
      height="auto"
      :min-height="receiverInfo.location?250:undefined"
      class="map-view-box -jumping pointer-pointer fadeIn delay_300 rounded-18px mx-auto"
      :src="
        receiverInfo.location
          ? `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${receiverInfo.location.lng},${receiverInfo.location.lat},17,0,0/800x400?access_token=pk.eyJ1IjoicGFqdWhhYW4iLCJhIjoiY2sxaHNtbnU3MDFjcjNta2V0OTZ0d2ExYiJ9.YKRh0EP7NnhbmuSil7AvSw`
          : require('@components/assets/icons/map-shop.svg')
      "
    >
      <location-marker
        v-if="receiverInfo.location"
        class="map-pointer"
      ></location-marker>
    </v-img>
  </div>
</template>

<script>
import CountryList from "@components/ui/country/country-list/CountryList.vue";
import LocationMarker from "@components/map/widgets/LocationMarker.vue";
export default {
  name: "SShopCustomerReceiverInfoWidget",
  components: { LocationMarker, CountryList },
  props: {
    receiverInfo: {
      require: true,
      type: Object,
    },
    dark: {
      default: false,
      type: Boolean,
    },
    // No map mode (By seller in shop configuration):
    noMap: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    countries() {
      return this.$store.getters.getCountries;
    },

    selected_country_detail() {

      return (
        this.receiverInfo.country &&
        this.countries &&
        this.countries.find((v) => v.alpha2 === this.receiverInfo.country)
      );
    },

    has_postcode() {
      return (
        !this.selected_country_detail || !this.selected_country_detail.nozip
      );
    },
  },

  created() {
    this.fetchCountries()
  }
};
</script>

<style scoped lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-buyer-receiver-info-widget {
  &.dark {
    .field-value {
      color: #ffffff;
      border-bottom: 1px dotted rgba(255, 255, 255, 0.78);
    }
  }
  .field-value {
    font-size: 0.9em;
    font-weight: 500;
    color: #444;
    border-bottom: 1px dotted #555;
    cursor: pointer;
  }
}
</style>
