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
  <v-card color="transparent" flat>
    <v-card-text>

      <u-widget-header
          :title="$t('onboarding.shipping.step1.title')"
          icon="looks_one"
      ></u-widget-header>


      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.shipping.step1.msg") }}
        </p>

        <v-img
          :src="require('../assets/warehouse-location.svg')"
          class="m-2 imgi"
        ></v-img>
      </div>

      <div class="widget-buttons">
        <v-btn color="#000" size="x-large" @click="warehouse_dialog = true">
          <v-icon class="me-1" size="small">place</v-icon>
          {{
            has_warehouse
              ? $t("onboarding.shipping.step1.edit_warehouse")
              : $t("onboarding.shipping.step1.add_warehouse")
          }}
        </v-btn>
      </div>
      <hr class="my-5" />


      <u-widget-header
          :title="$t('onboarding.shipping.step2.title')"
          icon="looks_two"
      ></u-widget-header>



      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.shipping.step2.msg") }}
        </p>

        <v-img
          :src="require('../assets/delivery.svg')"
          class="m-2 imgi"
        ></v-img>
      </div>

      <div class="widget-buttons">
        <v-btn
          :to="{ name: 'BPageShopLogisticShipping' }"
          color="#000"
          size="x-large"
        >
          <v-icon class="me-1" size="small">add</v-icon>
          {{ $t("onboarding.shipping.step2.add_delivery") }}
        </v-btn>
      </div>
    </v-card-text>
    <!-- ------------------------ Dialog > Edit Warehouse ---------------------- -->

    <v-dialog
      v-model="warehouse_dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title>
          <v-icon class="me-2">warehouse</v-icon>
          {{ $t("admin_shop.logistic.warehouse.title") }}
        </v-card-title>
        <v-card-text>
          <div class="widget-box">
            <u-widget-header
              :title="$t('global.commons.config')"
              icon="tune"
            ></u-widget-header>
            <v-list-subheader>
              {{ $t("admin_shop.logistic.warehouse.sub_title") }}
            </v-list-subheader>

            <b-inventory-warehouse
              :shop="shop"
              class="container-limited-1250px my-3"
              @update:warehouse="
                (val) => {
                  shop.warehouse = val;
                  warehouse_dialog = false;
                }
              "
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="warehouse_dialog = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import BInventoryWarehouse from "../../inventory/warehouse/BInventoryWarehouse.vue";

export default {
  name: "ShopOnboardingShippingTab",
  components: { BInventoryWarehouse },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    warehouse_dialog: false,
  }),

  computed: {
    warehouse() {
      return this.shop.warehouse;
    },
    has_warehouse() {
      return this.warehouse && this.warehouse.location;
    },
  },

  watch: {},

  methods: {},

  created() {},
};
</script>

<style lang="scss" scoped></style>
