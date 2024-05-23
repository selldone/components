<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <v-list-item
    class="row-hover"
    prepend-icon="map"
    v-bind="$attrs"
    @click="showSetMapTag()"
  >
    <v-list-item-title class="d-flex align-center">
      <b>{{ $t("product_location_profile.title") }}</b>

      <template v-if="product.map && product.map_id">
        <span>
          <v-icon class="mx-1" color="#111">{{
            $t("icons.chevron_next")
          }}</v-icon>

          <b>
            <flag
              v-if="product.map.country"
              :iso="product.map.country"
              :squared="false"
              class="me-1"
            />
            {{ product.map.title }}</b
          >
        </span>

        <v-spacer></v-spacer>
        <v-avatar
          v-if="product.map.user_id"
          :title="`Last editor / ${getFromNowString(product.map.updated_at)}`"
          class="mx-1 avatar-gradient -thin -staff"
          size="24"
        >
          <img :src="getUserAvatar(product.map.user_id)" />
        </v-avatar>
        <small class="ms-2" title="Range">
          <v-icon v-if="!product.map.range" size="small">all_inclusive</v-icon>
          <span v-else>{{ product.map.range }} km</span>
        </small>
      </template>
    </v-list-item-title>

    <v-list-item-subtitle>
      {{
        product.map
          ? product.map.address
          : $t("product_location_profile.empty_subtitle")
      }}
    </v-list-item-subtitle>

    <template v-slot:append>
      <v-list-item-action end>
        <v-btn
          :color="product.map_id ? 'success' : 'primary'"
          icon
          variant="text"
        >
          <v-icon>{{ product.map_id ? "check_box" : "add_box" }}</v-icon>
        </v-btn>
      </v-list-item-action>
    </template>
  </v-list-item>

  <!-- ██████████████████████ Dialog > Select Map Tag ██████████████████████ -->

  <v-dialog
    v-model="map_dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1">map</v-icon>

        {{ $t("product_location_profile.dialog.header") }}
      </v-card-title>
      <v-card-text>
        <div class="widget-box -large mb-5">
          <s-widget-header
            :add-caption="
              $t('product_location_profile.dialog.action_new_location')
            "
            :title="$t('product_location_profile.dialog.title')"
            :to="{ name: 'BPageShopChannelMap' }"
            add-text
            icon="place"
          >
          </s-widget-header>
          <v-list-subheader>
            {{ $t("product_location_profile.dialog.subtitle") }}
          </v-list-subheader>
          <div class="typo-body mb-3">
            <v-icon class="me-1">notification_important</v-icon>
            <span v-html="$t('product_location_profile.dialog.tips')"></span>
          </div>
          <b-map-tag-input
            v-model="map_input"
            :shop="shop"
            return-object
          ></b-map-tag-input>

          <v-row align="center">
            <v-col cols="12" sm="6">
              <v-img
                v-if="map_url"
                :src="map_url"
                aspect-ratio="1"
                class="map-view-box -jumping rounded-18px mx-auto my-5"
                height="auto"
                max-width="300"
                min-height="200"
                width="100%"
              >
                <u-map-view-pin class="map-pointer"></u-map-view-pin>
              </v-img>
            </v-col>

            <v-col v-if="map_input" cols="12" sm="6">
              <div v-if="full_address" class="mb-3 typo-body">
                <v-icon class="me-1">assistant_direction</v-icon>
                {{ $t("global.commons.address") }}
                :
                <flag
                  v-if="map_input.country"
                  :iso="map_input.country"
                  :squared="false"
                  class="mx-1"
                />
                {{ full_address }}
              </div>

              <div v-if="map_input.message" class="mb-3">
                <v-icon class="me-1">chat_bubble</v-icon>
                {{ $t("global.commons.message") }}:
                {{ map_input.message }}
              </div>

              <div :title="getFromNowString(map_input.created_at)" class="my-1">
                <v-icon class="me-1">calendar_today</v-icon>
                {{ $t("global.commons.created_at") }}:
                {{ getLocalTimeString(map_input.created_at) }}
              </div>
              <div :title="getFromNowString(map_input.updated_at)" class="my-1">
                <v-icon class="me-1">edit_calendar</v-icon>
                Last update:
                {{ getLocalTimeString(map_input.updated_at) }}
              </div>
            </v-col>
          </v-row>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="map_dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            color="primary"
            size="x-large"
            variant="elevated"
            @click="selectMap(map_input)"
          >
            <v-icon start>check</v-icon>
            {{ $t("global.actions.confirm") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { defineComponent } from "vue";
import UMapViewPin from "../../../../ui/map/view/market/UMapViewPin.vue";
import BMapTagInput from "../../../map/tag/input/BMapTagInput.vue";
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";

export default defineComponent({
  name: "BProductProfileMap",
  components: { BMapTagInput, UMapViewPin },

  props: {
    product: {
      required: true,
      type: Object,
    },
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },
  data: function () {
    return {
      map_dialog: false,
      map_input: null,
    };
  },

  computed: {
    map_url() {
      return (
        this.map_input &&
        this.map_input.location &&
        this.map_input.location.lng &&
        MapHelper.GetMapImage(
          this.map_input.location.lng,
          this.map_input.location.lat,
          15,
        )
      );
    },
    full_address() {
      return (
        this.map_input &&
        MapHelper.GenerateFullAddressFromMapInfo(this.map_input)
      );
    },
  },

  methods: {
    // ████████████████████ Set Map ████████████████████

    showSetMapTag() {
      this.map_input = this.product.map; // Return object!
      this.map_dialog = true;
    },
    selectMap(map_input) {
      this.product.map_id = map_input ? map_input.id : null;
      this.product.map = map_input; // Assign nested object
      this.map_dialog = false;
    },
  },
});
</script>

<style lang="scss" scoped></style>
