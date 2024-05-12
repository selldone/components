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
  <!-- ███████████████████████ Dialog > Add / Edit ███████████████████████ -->

  <v-dialog
    v-model="dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start">
      <v-card-title>
        <v-icon class="me-2">share_location</v-icon>
        Map location tag <b v-if="currentItem"> | {{ currentItem.title }}</b>
      </v-card-title>
      <v-card-text>
        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Location ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

        <div class="widget-box mb-5">
          <s-widget-header icon="map" title="Location"></s-widget-header>
          <v-list-subheader
            >Choose the map tag's position by clicking on the following map.
          </v-list-subheader>

          <v-img
            :class="{ 'img-grayscale': !map_url }"
            :src="
              map_url
                ? map_url
                : require('../../../../assets/guides/map-street.png')
            "
            aspect-ratio="1"
            class="map-view-box -jumping pointer-pointer fadeIn delay_300 rounded-18px"
            height="auto"
            min-height="250"
            width="100%"
            @click="showSelectLocation"
          >
            <u-map-view-pin
              v-if="currentItem.location"
              class="map-pointer"
            ></u-map-view-pin>
          </v-img>
        </div>

        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Tagging ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
        <div class="widget-box mb-5">
          <s-widget-header
            icon="add_location"
            title="Tagging"
          ></s-widget-header>
          <v-list-subheader>
            Enter the title and, optional tags for the map location.
          </v-list-subheader>

          <v-list
            class="border-between-vertical"
            density="compact"
            bg-color="transparent"
          >
            <v-list-item
              title="Show list of assigned products."
              @click="show_products = !show_products"
              prepend-icon="inventory"
            >
              <v-list-item-title class="font-weight-bold">
                Products
                <v-icon class="ms-1" color="green" size="small"
                  >check_circle
                </v-icon>
              </v-list-item-title>
              <v-list-item-subtitle>
                You can assign this location to products in product > edit >
                profiles.
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-list-item-action end>
                  <b> {{ currentItem.products_count }}</b>
                </v-list-item-action>
              </template>

              <v-tooltip activator="parent"
                >Click to show/hide the list of assigned products.
              </v-tooltip>
            </v-list-item>

            <v-expand-transition>
              <div v-if="show_products && currentItem.id">
                <b-map-tag-products
                  :map-tag="currentItem"
                  :shop="shop"
                  class="my-3"
                ></b-map-tag-products>
              </div>
            </v-expand-transition>

            <v-list-item prepend-icon="add_business">
              <v-list-item-title class="font-weight-bold">
                Vendors
                <v-icon class="ms-1" color="green" size="small"
                  >check_circle
                </v-icon>
              </v-list-item-title>
              <v-list-item-subtitle>
                You can assign this location to vendors on vendor > edit.
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-list-item-action end>
                  <b> {{ currentItem.vendors_count }}</b>
                </v-list-item-action>
              </template>
            </v-list-item>
          </v-list>

          <v-text-field
            v-model="currentItem.title"
            :rules="[GlobalRules.required()]"
            label="Title*"
            messages="The title will be shown only to admins."
            variant="underlined"
          >
          </v-text-field>

          <u-smart-suggestion
            :samples="$tm('suggestions.map_tag.title')"
            @select="(v) => (currentItem.title = v)"
            class="mb-5"
          >
          </u-smart-suggestion>

          <v-combobox
            v-model="currentItem.tags"
            chips
            closable-chips
            label="Tags"
            messages="We use this tags to create filters."
            multiple
            variant="underlined"
          ></v-combobox>
        </div>

        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Critical Zone ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

        <div v-if="currentItem.id" class="widget-box mb-5 mt-10">
          <s-widget-header
            :title="$t('global.commons.critical_zone')"
            icon="warning_amber"
          >
          </s-widget-header>

          <u-smart-verify
            v-model="accept_delete"
            class="my-3"
            color="red"
            true-description="Removing the location will reset the location tags of all linked products."
            true-title="I verify to remove this location."
          ></u-smart-verify>

          <div class="widget-buttons">
            <v-btn
              :class="{ disabled: !accept_delete }"
              :loading="busy_delete"
              color="red"
              size="x-large"
              variant="flat"
              @click="removeLocation(currentItem)"
            >
              <v-icon start>remove</v-icon>

              <div>
                Remove Location
                <div class="small mt-1">
                  Clear location of
                  <b> {{ currentItem.products_count }}x </b> product(s).
                </div>
              </div>
            </v-btn>
          </div>
        </div>

        <div class="min-height-20vh"></div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            :disabled="!currentItem.location || !currentItem.title"
            :loading="busy_save"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="saveTag"
          >
            <v-icon start>{{ currentItem.id ? "save" : "add" }}</v-icon>
            {{
              currentItem.id
                ? $t("global.actions.save")
                : $t("global.actions.add")
            }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import UMapViewPin from "../../../../ui/map/view/market/UMapViewPin.vue";
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import BMapTagProducts from "../../../map/tag/products/BMapTagProducts.vue";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";

export default {
  name: "BMapTagAdd",

  components: {
    USmartSuggestion,
    BMapTagProducts,
    USmartVerify,
    UMapViewPin,
  },
  emits: ["update:modelValue", "add", "edit", "delete"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
    modelValue: {},
    currentItem: {},
  },
  data: () => ({
    dialog: false,

    busy_save: false,

    //---------------------------------------
    accept_delete: false,
    busy_delete: false,

    //---------------------------------------
    show_products: false,
  }),
  computed: {
    map_url() {
      return (
        this.currentItem &&
        this.currentItem.location &&
        this.currentItem.location.lng &&
        MapHelper.GetMapImage(
          this.currentItem.location.lng,
          this.currentItem.location.lat,
          15,
        )
      );
    },
  },

  watch: {
    modelValue(val) {
      this.dialog = val;
    },
    dialog(val) {
      this.$emit("update:modelValue", val);
    },
  },

  created() {},

  methods: {
    saveTag() {
      this.busy_save = true;
      let promise = null;

      if (this.currentItem.id) {
        // Edit mode
        promise = axios.put(
          window.API.PUT_EDIT_SHOP_MAP_TAG(this.shop.id, this.currentItem.id),
          this.currentItem,
        );
      } else {
        // Create mode
        promise = axios.post(
          window.API.POST_CREATE_SHOP_MAP_TAG(this.shop.id),
          this.currentItem,
        );
      }

      promise
        .then(({ data }) => {
          if (!data.error) {
            this.dialog = false;
            if (!this.currentItem.id) {
              // Create mode:
              this.$emit("add", data.map_tag);
              this.showSuccessAlert(
                null,
                "The location has been added successfully.",
              );
            } else {
              this.$emit("edit", data.map_tag);
              this.showSuccessAlert(
                null,
                "The location has been updated successfully.",
              );
            }
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    showSelectLocation() {
      let center = { lat: 0, lng: 0 };
      if (this.currentItem && this.currentItem.location)
        center = this.currentItem.location;

      this.showMap(
        center,
        null,
        this.currentItem,
        (info) => {
          Object.assign(this.currentItem, info);
          this.closeMap();
          this.$forceUpdate();
        },
        false,
      );
    },

    // -------------------------- Remove Location --------------------------

    removeLocation(map_tag) {
      this.busy_delete = true;
      axios
        .delete(window.API.DELETE_SHOP_MAP_TAG(this.shop.id, map_tag.id))
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("delete", data.id);
            this.showSuccessAlert(
              null,
              "The location has been removed successfully.",
            );
            this.dialog = false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
