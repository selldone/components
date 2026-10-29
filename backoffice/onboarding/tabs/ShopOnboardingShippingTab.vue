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
  <v-card
    color="transparent"
    flat
    :class="{ 's--onboarding-shipping text-start': modern }"
  >
    <div v-if="modern">
      <p class="s--onboarding-shipping__intro">
        {{ $t("onboarding.modern.shipping.intro") }}
      </p>
      <div class="sd-modern-records s--onboarding-shipping__rows">
        <div class="sd-modern-record s--onboarding-shipping__row">
          <div>
            <h3>{{ $t("onboarding.modern.shipping.warehouse") }}</h3>
            <p>
              {{
                $t(
                  has_warehouse
                    ? "onboarding.modern.shipping.configured"
                    : "onboarding.modern.shipping.not_configured",
                )
              }}
            </p>
          </div>
          <v-btn
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
            @click="warehouse_dialog = true"
            >{{
              $t(
                has_warehouse
                  ? "onboarding.shipping.step1.edit_warehouse"
                  : "onboarding.shipping.step1.add_warehouse",
              )
            }}</v-btn
          >
        </div>
        <div class="sd-modern-record s--onboarding-shipping__row">
          <div>
            <h3>{{ $t("onboarding.modern.shipping.delivery") }}</h3>
            <p>{{ $t("onboarding.modern.shipping.delivery_description") }}</p>
          </div>
          <v-btn
            :to="{ name: 'BPageShopLogisticShipping' }"
            target="_blank"
            rel="noopener noreferrer"
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
            >{{ $t("onboarding.modern.shipping.manage") }}<v-icon end size="16">north_east</v-icon></v-btn
          >
        </div>
      </div>
      <p class="s--onboarding-shipping__note">
        <v-icon size="16" aria-hidden="true">info_outline</v-icon
        ><span>{{ $t("onboarding.modern.shipping.note") }}</span>
      </p>
    </div>
    <v-card-text v-else>
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
      <v-card :class="{ 's--onboarding-shipping-dialog text-start': modern }">
        <v-card-title :class="{ 'sd-modern-title-text': modern }">
          <v-icon class="me-2">warehouse</v-icon>
          {{ $t("admin_shop.logistic.warehouse.title") }}
        </v-card-title>
        <v-card-text>
          <div :class="modern ? 'sd-modern-content' : 'widget-box'">
            <u-widget-header
              v-if="!modern"
              :title="$t('global.commons.config')"
              icon="tune"
            ></u-widget-header>
            <v-list-subheader v-if="!modern">
              {{ $t("admin_shop.logistic.warehouse.sub_title") }}
            </v-list-subheader>

            <b-inventory-warehouse
              :modern="modern"
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
          <div :class="modern ? 'sd-modern-actions' : 'widget-buttons'">
            <v-btn
              :size="modern ? undefined : 'x-large'"
              :class="{ 'sd-modern-button': modern }"
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
    modern: { type: Boolean, default: false },
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

<style lang="scss" scoped>
.s--onboarding-shipping {
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  min-width: 0;

  &__intro {
    margin: 0;
    color: var(--sd-modern-muted);
  }
  &__rows {
    margin-block-start: 18px;
  }
  &__row {
    grid-template-columns: minmax(0, 1fr) auto;
    padding-block: 14px;
    gap: 10px 16px;
    h3 {
      margin: 0;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.5;
    }
    p {
      margin: 4px 0 0;
      font-size: 12px;
      color: var(--sd-modern-muted);
    }
  }
  &__note {
    display: flex;
    align-items: start;
    gap: 8px;
    margin: 18px 0 0;
    font-size: 12px;
    color: var(--sd-modern-muted);
    .v-icon {
      margin-block-start: 2px;
    }
  }
}
.s--onboarding-shipping-dialog {
  font-family: inherit;
  .sd-modern-title-text {
    padding: 20px 24px 12px;
    font-size: 18px;
    font-weight: 500;
  }
}
@media (max-width: 600px) {
  .s--onboarding-shipping__row {
    grid-template-columns: minmax(0, 1fr);
    .sd-modern-button {
      justify-self: start;
    }
  }
}
</style>
