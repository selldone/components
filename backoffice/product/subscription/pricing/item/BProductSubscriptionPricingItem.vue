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
  <div
    class="product-variant-card widget widget-hover rounded-18px d-flex flex-wrap my-2 p-3"
    @click="$emit('select')"
  >
    <div class="cel-1 border-end-grater-md pe-3">
      <b>
        <v-icon
          v-if="enable != null"
          :color="enable ? 'green' : 'red'"
          :title="enable ? 'Available to select by customers.' : 'Unavailable.'"
          class="me-1"
          size="small"
          >{{ enable ? "check_circle" : "cancel" }}
        </v-icon>

        {{ subscriptionPrice.title }}</b
      >
      <div v-if="subscriptionPrice.description" class="small my-1">
        {{ subscriptionPrice.description }}
      </div>
    </div>

    <div class="cel-2 border-end-grater-md">
      <div class="min-width-150 py-1 px-2">
        <p class="mb-1"><small>Code:</small> PRC{{ subscriptionPrice.id }}</p>

        <p class="mb-1">
          <small>{{ $t("global.commons.sku") }}:</small> {{ sku ? sku : "-" }}
        </p>
      </div>
    </div>

    <div class="cel-3 border-end-grater-md">
      <u-price
        :amount="price"
        :currency="currency"
        :title="$t('product_admin.inventory.variant_item.price')"
        class="text-success"
        large
      ></u-price>
      <div class="font-weight-black my-1" title="Billing period">
        <v-icon :color="period?.color" class="me-1" size="small">circle</v-icon>
        {{ $t(period?.title) }}
      </div>
    </div>

    <div class="cel-4 border-end-grater-md">
      <!-- Gateway info -->
      <div v-if="gateway" class="mb-1 d-flex align-center w-100">
        <img
          :src="getShopImagePath(gateway.icon)"
          class="me-1"
          height="24"
          width="24"
        />
        <b class="flex-grow-1 mx-1">{{ gateway.name }}</b>
        <v-chip
          v-if="!shop_gateway.enable"
          class="mx-1"
          color="red"
          label
          size="small"
          title="Your gateway is disable."
          variant="flat"
        >
          <v-icon start>credit_card_off</v-icon>
          {{ $t("global.commons.disable") }}
        </v-chip>
        <v-chip
          v-else-if="!shop_gateway.livemode"
          class="mx-1"
          color="amber"
          label
          size="small"
          title="Your gateway is in the debug mode."
          variant="flat"
        >
          <v-icon start>science</v-icon>
          {{ $t("global.commons.debug") }}
        </v-chip>
      </div>
      <!-- 3rd party keep meta -->
      <v-icon
        v-if="!subscriptionPrice.meta"
        class="op-0-2 mt-2"
        size="large"
        title="Price not synced!"
        >foggy
      </v-icon>
      <div v-else class="small">
        <u-text-value-dashed v-for="(v, k) in subscriptionPrice.meta" :key="k">
          <template v-slot:label>{{ k }}</template>
          <code v-copy @click.stop>{{ v }}</code>
        </u-text-value-dashed>
      </div>
    </div>

    <div
      v-if="badge || loading"
      class="blue-badge m-2 align-self-center flex-grow-0"
    >
      <v-progress-circular v-if="loading" color="#fff" indeterminate>
      </v-progress-circular>
      <span v-else>{{ badge }}</span>
    </div>

    <div v-if="hasDelete" class="m-2 ms-auto align-self-center flex-grow-0">
      <u-button-circle
        v-if="!subscriptionPrice.deleted_at"
        :tooltip="$t('global.actions.delete')"
        icon="close"
        icon-color="red"
        @click="showDeleteDialog()"
      />
      <u-button-circle
        v-else
        :tooltip="$t('global.actions.restore')"
        icon="cached"
        icon-color="#673AB7"
        @click="showRestoreDialog()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import UTextValueDashed from "../../../../../ui/text/value-dashed/UTextValueDashed.vue";

export default {
  name: "BProductSubscriptionPricingItem",
  components: { UTextValueDashed },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
    subscriptionPrice: {
      required: true,
      type: Object,
    },

    hasDelete: {
      default: false,
      type: Boolean,
    },
    badge: {},
    loading: {},

    validateVariants: {
      type: Array,
    },
  },
  data() {
    return {};
  },
  computed: {
    enable() {
      return this.subscriptionPrice.enable;
    },

    sku() {
      return this.subscriptionPrice.sku;
    },

    price() {
      return this.subscriptionPrice.price;
    },

    currency() {
      return this.subscriptionPrice.currency;
    },

    period() {
      return BillingPeriod[this.subscriptionPrice.period];
    },

    shop_gateways() {
      return this.shop.shop_gateways;
    },
    shop_gateway() {
      return (
        this.shop_gateways &&
        this.shop_gateways.find(
          (sg) => sg.gateway?.code === this.subscriptionPrice.gateway_code,
        )
      );
    },
    gateway() {
      return this.shop_gateway?.gateway;
    },
  },
  methods: {
    showDeleteDialog() {
      NotificationService.openDangerAlert(
        this.$t("product_admin.inventory.variant_item.delete_dialog.title"),
        this.$t("product_admin.inventory.variant_item.delete_dialog.message"),
        this.$t("global.actions.delete"),
        () => {
          this.$emit("delete");
        },
      );
    },

    showRestoreDialog() {
      NotificationService.openDangerAlert(
        "Restore deleted variant",
        "Do you want to restore this deleted variant?",
        "Yes, Restore now",
        () => {
          this.$emit("restore");
        },
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.product-variant-card {
  cursor: pointer;
  min-height: 90px;
  position: relative;
  flex-direction: row !important;
}

.cel-1,
.cel-2,
.cel-3,
.cel-4 {
  display: flex;
  flex-direction: column;
}

.cel-1 {
  align-items: flex-start;
  justify-content: flex-start;
  flex-grow: 1;
  width: 50%;
  max-width: 300px;
  min-width: 250px;
  text-align: start;
}

.cel-2 {
  align-items: flex-start;
  justify-content: center;
  padding: 8px;
}

.cel-3 {
  justify-content: center;
  padding: 8px;
  flex-grow: 1;
  min-width: 150px;
  align-items: center;
}

.cel-4 {
  justify-content: center;
  flex-grow: 0;
  padding: 8px;
  min-width: 100px;
  align-items: center;

  code {
    border-radius: 5px;
    padding: 2px 6px;
  }
}
</style>
