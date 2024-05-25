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
  <!-- ██████████████████ Config ██████████████████ -->
  <div class="widget-box" v-bind="$attrs">
    <s-widget-header
      :disabled="!enable"
      add-caption="Open map"
      add-icon="open_in_new"
      add-text
      disabled-reason="Disabled!"
      icon="map"
      title="Map | Location based search"
      @click:add="show_map_urls = true"
    ></s-widget-header>

    <v-list-subheader>
      Your customers can find products by searching on the map.
    </v-list-subheader>

    <u-loading-progress v-if="busy_set"></u-loading-progress>

    <v-select
      v-model="driver"
      :items="map_providers"
      :return-object="false"
      bg-color="transparent"
      flat
      item-title="title"
      item-value="code"
      messages="Select the map service provider. More map service providers will be available in the future."
      title="Provider"
      variant="solo"
    >
      <template v-slot:item="{ item, props }">
        <v-list-item class="text-start" v-bind="props">
          <template v-slot:prepend>
            <img :src="item.raw.icon" class="me-2" height="24" width="24" />
          </template>
          <template v-slot:title>
            <b>{{ item.raw.title }}</b>
          </template>
        </v-list-item>
      </template>
      <template v-slot:selection="{ item }">
        <img :src="item.raw.icon" class="me-2" height="24" width="24" />
        <b>{{ item.raw.title }}</b>
      </template>
    </v-select>

    <u-smart-switch
      v-model="enable"
      :disabled="busy_set"
      class="my-3"
      false-gray
      false-icon="disabled_visible"
      false-title="Disable"
      true-description="You will have a map page with tagged products on your-domain.com/map."
      true-icon="mode_of_travel"
      true-title="Enable map listing"
      @change="setEnable"
    >
    </u-smart-switch>

    <div>
      <b-map-driver-options :driver="driver"></b-map-driver-options>
    </div>
  </div>

  <!-- ███████████████████████ Dialog > Show Links ███████████████████████ -->

  <v-bottom-sheet v-model="show_map_urls" inset max-width="520">
    <v-card class="text-start" rounded="t-xl">
      <v-card-title>
        <v-avatar
          :image="getShopImagePath(shop.icon, 128)"
          class="me-1 avatar-gradient -shop -thin"
          size="36"
        >
        </v-avatar>
        {{ shop.title }}
      </v-card-title>
      <v-list class="border-between-vertical my-5" lines="three">
        <v-list-item
          :href="getShopMainUrl(shop) + '/map'"
          append-icon="open_in_new"
          prepend-icon="shopping_bag"
          target="_blank"
        >
          <v-list-item-title><b>Products Map Page</b></v-list-item-title>
          <v-list-item-subtitle
            >{{ getShopMainUrl(shop) + "/map" }}
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item
          :href="getShopMainUrl(shop) + '/map-vendors'"
          append-icon="open_in_new"
          prepend-icon="store"
          target="_blank"
        >
          <v-list-item-title><b>Vendors Map Page</b></v-list-item-title>
          <v-list-item-subtitle
            >{{ getShopMainUrl(shop) + "/map-vendors" }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import BMapDriverOptions from "../../map/driver/options/BMapDriverOptions.vue";
import { Map } from "@selldone/core-js";

export default {
  name: "BMapConfig",
  components: {
    BMapDriverOptions,

    USmartSwitch,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    map_providers: Object.values(Map.Providers),

    driver: Map.Providers.Mapbox.code,
    enable: false,
    busy_set: false,

    show_map_urls: false,
  }),
  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
  },

  watch: {},

  created() {
    this.enable = ShopOptionsHelper.IsEnableShopMap(this.shop);
  },

  methods: {
    setEnable() {
      this.busy_set = true;
      axios
        .post(window.API.POST_SET_SHOP_OPTIONS_SHOP_MAP(this.shop.id), {
          enable: this.enable,
          driver: this.driver,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.shop.options = data.options;
            this.showSuccessAlert(
              null,
              "Shop map listing has been updated successfully.",
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
