<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <div v-intersect.once="onIntersect">
    <v-btn-toggle
      v-model="key_selected"
      class="mb-3"
      rounded="xl"
      style="height: 64px"
      variant="flat"
    >
      <v-btn
        v-for="item in keys"
        :key="item.code"
        :title="$t(item.name)"
        :value="item.code"
        size="small"
        stacked
      >
        <img
          :class="{ 'img-grayscale': key_selected !== item.code }"
          :src="item.image"
          class="mx-2"
          width="24px"
        />
        <div class="mt-1 tnt">{{ $t(item.name) }}</div>
      </v-btn>
    </v-btn-toggle>

    <u-map-countries-heatmap
      v-if="!busy"
      :country-data="map_data"
      :high-color="color"
      class="mx-2 my-3"
      country-stroke-color="#ddd"
      default-country-fill-color="#fafafa"
      has-tooltip
      low-color="#eee"
      style="height: 350px"
    >
      <template v-slot="{ country }">
        <div v-if="country">
          <div v-for="item in keys" :key="item.code" class="d-flex my-1">
            <small
              ><i
                :style="{ color: item.color }"
                class="fas fa-circle fa-xs mx-1"
              ></i>
              {{ $t(item.name) }}:</small
            >
            <v-spacer></v-spacer>
            <span class="h4">{{
              numeralFormat(getValue(country, item.code), "0,0")
            }}</span>
          </div>
        </div>
      </template>
    </u-map-countries-heatmap>

    <u-loading-ellipsis
      v-else
      class="ma-auto"
      height="350px"
    ></u-loading-ellipsis>
  </div>
</template>

<script>
import UMapCountriesHeatmap from "../../../../../ui/map/countries/heatmap/UMapCountriesHeatmap.vue";
import ULoadingEllipsis from "../../../../../ui/loading/ellipsis/ULoadingEllipsis.vue";
import { UserActivityKeys } from "@selldone/core-js/enums/user/UserActivityKeys";

export default {
  name: "BDashboardShopCustomersActivityMap",
  components: {
    ULoadingEllipsis,
    UMapCountriesHeatmap,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    countries: null,
    busy: false,

    key_selected: "products_views",
    keys: UserActivityKeys,
  }),

  computed: {
    color() {
      return this.keys?.find((item) => item.code === this.key_selected).color;
    },
    map_data() {
      if (!this.countries) return {};

      let out = {};

      this.countries.forEach((item) => {
        out[item.country_code] = item[this.key_selected];
      });
      return out;
    },
  },

  created() {},
  methods: {
    onIntersect(isIntersecting, entries, observer) {
      if (isIntersecting) {
        this.fetchActivityByCountry();
      }
    },

    fetchActivityByCountry() {
      this.busy = true;

      axios
        .get(window.API.GET_SHOP_STATISTIC_COUNTRY(this.shop.id))
        .then(({ data }) => {
          this.countries = data.countries;
        })
        .finally(() => {
          this.busy = false;
        });
    },

    getValue(country_code, key) {
      const item = this.countries.find(
        (item) => item.country_code === country_code,
      );
      return item && item[key] ? item[key] : 0;
    },
  },
};
</script>

<style lang="scss" scoped></style>
