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
  <section
    v-if="modern"
    class="b-product-analytics b-product-expectations-modern sd-modern-widget text-start"
  >
    <header class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon size="18" aria-hidden="true"
            >notifications_active</v-icon
          ></span
        >
        <div>
          <h2 class="sd-modern-title-text">
            {{ $t("b_product_dashboard.analytics.expectations_title") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("b_product_dashboard.analytics.expectations_subtitle") }}
          </p>
        </div>
      </div>
    </header>
    <div
      v-for="item in expectationLists"
      :key="item.key"
      class="b-product-expectations-modern__row"
    >
      <img :src="item.image" :alt="item.title" width="28" height="28" />
      <div>
        <h3>{{ item.title }}</h3>
        <p>
          {{ numeralFormat(item.count, "0,0") }}
          {{ $t("product_admin.dashboard.inform.unit") }}
        </p>
      </div>
      <v-btn
        :href="item.href"
        :disabled="!item.count"
        target="_blank"
        rel="noopener noreferrer"
        variant="text"
        class="sd-modern-button sd-modern-button--small"
        ><v-icon size="16" class="me-1">download</v-icon
        >{{ $t("b_product_dashboard.analytics.download_list") }}</v-btn
      >
    </div>
  </section>
  <s-widget-box
    v-else
    :sub-title="$t('product_admin.dashboard.inform.title_small')"
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mr-sm' style='font-size: 6px;'></span>  ${$t(
      'product_admin.dashboard.inform.title',
    )}</h5>`"
    icon="fa:fas fa-bullhorn"
  >
    <p>
      <v-icon size="small">notifications_active</v-icon>
      {{ $t("product_admin.dashboard.inform.message") }}
    </p>

    <v-list class="bg-transparent border-between-vertical overflow-hidden">
      <v-list-item
        :disabled="!product.for_auction"
        :href="download_for_auction"
        target="_blank"
      >
        <template v-slot:prepend>
          <v-avatar rounded="0">
            <img src="../../../../assets/icons/discounted-product.svg" />
          </v-avatar>
        </template>

        <v-list-item-title class="text-h4 font-weight-black">
          {{ numeralFormat(product.for_auction, "0,0a") }}
          <small class="text-subtitle-1">{{
            $t("product_admin.dashboard.inform.unit")
          }}</small>
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ $t("product_admin.dashboard.inform.waiting_for_auction") }}
        </v-list-item-subtitle>

        <template v-slot:append>
          <v-list-item-action
            class="align-self-center ma-auto"
            end
            title="Download the list"
          >
            <v-icon>download</v-icon>
          </v-list-item-action>
        </template>
      </v-list-item>

      <v-list-item
        :disabled="!product.for_available"
        :href="download_for_available"
        target="_blank"
      >
        <template v-slot:prepend>
          <v-avatar rounded="0">
            <img src="../../../../assets/icons/available-product.svg" />
          </v-avatar>
        </template>

        <v-list-item-title class="text-h4 font-weight-black">
          {{ numeralFormat(product.for_available, "0,0a") }}
          <small class="text-subtitle-1">{{
            $t("product_admin.dashboard.inform.unit")
          }}</small>
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ $t("product_admin.dashboard.inform.waiting_for_available") }}
        </v-list-item-subtitle>

        <template v-slot:append>
          <v-list-item-action
            class="align-self-center ma-auto"
            end
            title="Download the list"
          >
            <v-icon>download</v-icon>
          </v-list-item-action>
        </template>
      </v-list-item>
    </v-list>
  </s-widget-box>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";

export default {
  name: "BProductMarketingAbstractView",
  components: { SWidgetBox },
  props: {
    modern: Boolean,
    product: {
      required: true,
      type: Object,
    },
    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({}),

  computed: {
    expectationLists() {
      return [
        {
          key: "sale",
          title: this.$t("product_admin.dashboard.inform.waiting_for_auction"),
          count: this.product.for_auction,
          href: this.download_for_auction,
          image: require("../../../../assets/icons/discounted-product.svg"),
        },
        {
          key: "available",
          title: this.$t(
            "product_admin.dashboard.inform.waiting_for_available",
          ),
          count: this.product.for_available,
          href: this.download_for_available,
          image: require("../../../../assets/icons/available-product.svg"),
        },
      ];
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    download_for_auction() {
      if (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/) {
        return window.VAPI.GET_MY_VENDOR_EXPORT_FOR_AUCTION(
          this.product.vendor_id,
          this.product.id,
        );
      }

      return window.API.GET_EXPORT_FOR_AUCTION(
        this.product.shop_id,
        this.product.id,
      );
    },
    download_for_available() {
      if (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/) {
        return window.VAPI.GET_MY_VENDOR_EXPORT_FOR_AVAILABLE(
          this.product.vendor_id,
          this.product.id,
        );
      }

      return window.API.GET_EXPORT_FOR_AVAILABLE(
        this.product.shop_id,
        this.product.id,
      );
    },
  },
  created() {},
};
</script>

<style scoped lang="scss">
.b-product-expectations-modern {
  &__row {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    padding-block: 16px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__row:last-child {
    padding-block-end: 0;
    border: 0;
  }
  &__row h3 {
    font-size: 13px;
    line-height: 20px;
    font-weight: 500;
    margin: 0;
  }
  &__row p {
    font-size: 12px;
    line-height: 19px;
    color: var(--sd-modern-muted);
    margin: 4px 0 0;
  }
  @media (max-width: 600px) {
    &__row > .v-btn {
      grid-column: 2 / -1;
      justify-self: start;
    }
  }
}
</style>
