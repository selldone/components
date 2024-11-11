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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="text-start">
    <v-expansion-panels>
      <v-expansion-panel
        v-if="warehouse"
        class="border"
        elevation="0"
        style="border-radius: 16px"
      >
        <v-expansion-panel-title>
          <img
            class="me-2"
            height="36px"
            src="../../../assets/logistics/warehouse.svg"
            style="max-width: 48px"
          />

          <div v-if="!!warehouse.name || !!full_address">
            <p class="font-weight-bold mb-1">
              {{ warehouse.title }}
              {{ warehouse.name ? ` > ${warehouse.name}` : "" }}
            </p>

            <flag
              v-if="warehouse.country"
              :iso="warehouse.country"
              :squared="false"
              class="me-1"
            />

            <small class="mx-1">{{ warehouse.state }} ●</small>

            <small>{{ full_address }}</small>
          </div>
          <div v-else>
            <p class="font-weight-bold m-0">
              <v-icon class="me-2" color="success">add</v-icon>

              {{ $t("shop_warehouse_edit.title") }}

              <v-chip
                class="mx-1"
                color="red"
                pill
                size="x-small"
                variant="flat"
              >
                <v-icon class="blink-me" start>circle</v-icon>

                {{ $t("global.commons.important") }}
              </v-chip>
            </p>
            <p class="small m-0">
              {{ $t("shop_warehouse_edit.message") }}
            </p>
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <div class="text-start">
            <v-text-field
              v-model="warehouse.title"
              :label="$t('global.commons.name')"
              :messages="$t('shop_warehouse_edit.name_input_message')"
              :placeholder="$t('shop_warehouse_edit.name_input')"
              color="primary"
              variant="underlined"
              @update:model-value="changed = true"
            />

            <div class="mt-5">
              <p>
                <span class="text-muted">
                  <i class="fas fa-directions me-1" />
                  {{ $t("shop_warehouse_edit.address") }}:
                </span>

                <flag
                  v-if="map_location.country"
                  :iso="map_location.country"
                  :squared="false"
                  class="me-1"
                />
                <b>
                  <span class="mx-1">{{ warehouse.state }} ●</span>

                  {{ full_address }}</b
                >

                <u-button-circle
                  color="primary"
                  icon="place"
                  @click="
                    () => {
                      startup_mode_map_dialog = 'default';
                      map_dialog = true;
                    }
                  "
                />
              </p>
              <p>
                <span class="text-muted">
                  <i class="fas fa-people-carry me-1" />
                  {{ $t("shop_warehouse_edit.person_name") }}:
                </span>
                <b>{{ warehouse.name }}</b>

                <u-button-circle
                  color="primary"
                  icon="edit"
                  @click="
                    () => {
                      startup_mode_map_dialog = 'detail';
                      map_dialog = true;
                    }
                  "
                />
              </p>
              <p>
                <span class="text-muted">
                  <i class="fas fa-phone me-1" />
                  {{ $t("shop_warehouse_edit.phone_number") }}:
                </span>
                <b>{{ warehouse.phone }}</b>
              </p>
            </div>
            <v-expand-transition>
              <div v-if="changed" class="widget-buttons mt-3">
                <v-btn
                  :loading="busy"
                  color="primary"
                  size="x-large"
                  variant="elevated"
                  @click="updateWarehouse"
                >
                  <v-icon start>save</v-icon>
                  {{ $t("global.actions.save") }}
                </v-btn>
              </div>
            </v-expand-transition>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Select address -->

    <v-dialog
      v-model="map_dialog"
      :scrim="false"
      content-class="bg-light"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <u-map-view
        v-if="map_dialog"
        v-model="map_location"
        v-model:center="center"
        :address-type="$t('shop_warehouse_edit.address_name')"
        :color="ThemeColorDark"
        :confirm-text="$t('shop_warehouse_edit.confirm_action')"
        :receptor-type="$t('shop_warehouse_edit.person_name')"
        :startup-mode="startup_mode_map_dialog"
        :title="$t('shop_warehouse_edit.map_title')"
        :zoom="17"
        can-select-address
        has-address-book
        has-bottom-bar
        has-top-bar
        style="width: 100%; height: 100%"
        @clickSetLocation="onClickSetLocation"
        @close="map_dialog = false"
      />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";
import UMapView from "@selldone/components-vue/ui/map/view/UMapView.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";

export default {
  name: "BInventoryWarehouse",
  mixins: [TemplateMixin],

  components: { UMapView },
  emits: ["update:warehouse"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      required: true,
    },
  },
  data: () => ({
    busy: false,

    // Map

    map_dialog: false,
    center: { lat: 0, lng: 0 },
    startup_mode_map_dialog: "default", // detail

    map_location: {},

    warehouse: {},

    changed: false,
  }),
  computed: {
    full_address() {
      return MapHelper.GenerateFullAddressFromMapInfo(this.map_location);
    },
  },

  watch: {},
  created() {
    this.warehouse = this.vendor ? this.vendor.warehouse : this.shop.warehouse;
    this.loadData();
  },
  methods: {
    loadData() {
      if (!this.warehouse) this.warehouse = {};

      this.map_location = {
        address: this.warehouse.address,
        location: this.warehouse.location,
        no: this.warehouse.no,
        unit: this.warehouse.unit,
        name: this.warehouse.name,
        phone: this.warehouse.phone,
        message: this.warehouse.message,
        postal: this.warehouse.postal,
        country: this.warehouse.country,
        city: this.warehouse.city,

        state: this.warehouse.state,
        state_code: this.warehouse.state_code,
      }; // Same keys - values!

      if (this.warehouse.location)
        this.center = {
          lat: this.warehouse.location.lat,
          lng: this.warehouse.location.lng,
        };
    },

    updateWarehouse() {
      this.busy = true;

      axios
        .post(
          this.vendor // Marketplace Vendor Panel
            ? window.VAPI.POST_MY_VENDOR_SHOP_WAREHOUSE_ADMIN(this.vendor.id)
            : window.API.POST_SHOP_WAREHOUSE_ADMIN(this.shop.id),
          this.warehouse,
        )

        .then(({ data }) => {
          if (!data.error) {
            if (this.vendor) {
              this.vendor.warehouse = data.warehouse;
            } else {
              this.shop.warehouse = data.warehouse;
            }

            this.$emit("update:warehouse", data.warehouse);

            this.changed = false;
            this.showSuccessAlert(
              null,
              this.$t("shop_warehouse_edit.notifications.success_save"),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    onClickSetLocation(info) {
      if (!this.warehouse) this.warehouse = {};
      this.warehouse.address = info.address;
      this.warehouse.location = info.location;
      this.warehouse.no = info.no;
      this.warehouse.unit = info.unit;
      this.warehouse.name = info.name;
      this.warehouse.phone = info.phone;
      this.warehouse.message = info.message;
      this.warehouse.postal = info.postal;
      this.warehouse.country = info.country;
      this.warehouse.state = info.state;
      this.warehouse.state_code = info.state_code;
      this.warehouse.city = info.city;

      this.map_dialog = false;

      this.changed = true;
    },
  },
};
</script>

<style lang="scss" scoped></style>
