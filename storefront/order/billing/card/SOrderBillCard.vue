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
  <div>
    <b class="mb-2 d-block">{{ $t("global.commons.bill") }}</b>

    <!-- ------------------------ Raw Price ------------------------ -->
    <u-text-value-dashed>
      <template v-slot:label>
        <small>{{ $t("global.basket_order_info_summery.total_price") }}</small>
      </template>

      <u-price
        :amount="total_price + total_discount"
        :currency="basket.currency"
      ></u-price>
    </u-text-value-dashed>

    <!-- ------------------------ Discount ------------------------ -->
    <u-text-value-dashed>
      <template v-slot:label>
        <small>{{ $t("global.commons.discount") }}</small>
      </template>

      <u-price :amount="-total_discount" :currency="basket.currency"></u-price>
    </u-text-value-dashed>

    <!-- ------------------------ Delivery price ------------------------ -->
    <u-text-value-dashed>
      <template v-slot:label>
        <small>{{ $t("global.commons.shipping") }}</small>
      </template>

      <u-price
        v-if="delivery_price > 0"
        :amount="delivery_price"
        :currency="basket.currency"
      ></u-price>
      <span v-else-if="delivery_price === 0">{{
        $t("global.commons.free")
      }}</span>
      <span v-else-if="delivery_price === -1">{{
        $t("global.commons.sod")
      }}</span>
    </u-text-value-dashed>

    <!-- ------------------------ Tax ------------------------ -->
    <u-text-value-dashed v-if="tax">
      <template v-slot:label>
        <small>{{ $t("global.commons.tax") }}</small>
      </template>

      <u-price :amount="tax" :currency="basket.currency"></u-price>

      <span v-if="basket.tax_included">{{
        $t("global.commons.tax_included")
      }}</span>
    </u-text-value-dashed>

    <!-- ------------------------ Tax Shipping  ------------------------ -->
    <u-text-value-dashed v-if="tax_shipping">
      <template v-slot:label>
        <small>{{ $t("global.commons.tax_shipping") }}</small>
      </template>

      <u-price :amount="tax_shipping" :currency="basket.currency"></u-price>
    </u-text-value-dashed>

    <!-- ------------------------ Final Price ------------------------ -->
    <u-text-value-dashed>
      <template v-slot:label>
        <small>{{ $t("global.basket_order_info_summery.final_price") }}</small>
      </template>

      <u-price
        :amount="final_price"
        :currency="basket.currency"
        class="text-success"
        large
      ></u-price>
    </u-text-value-dashed>

    <!-- ------------------------ Billing Info ------------------------ -->

    <template v-if="billing">
      <hr />

      <u-text-value-dashed>
        <template v-slot:label>
          <small>{{ $t("global.commons.kind") }}</small>
        </template>

        <v-icon class="me-1"
          >{{ billing.business ? "business" : "person" }}
        </v-icon>
        {{
          billing.business
            ? $t("global.commons.business")
            : $t("global.commons.personal")
        }}
      </u-text-value-dashed>

      <!-- ------------------------ Tax ID ------------------------ -->
      <u-text-value-dashed v-if="billing.tax_id">
        <template v-slot:label>
          <small> Tax ID</small>
        </template>

        {{ billing.tax_id }}
      </u-text-value-dashed>

      <u-text-value-dashed v-if="billing.name">
        <template v-slot:label>
          <small> {{ $t("global.commons.name") }}</small>
        </template>

        {{ billing.name }}
      </u-text-value-dashed>

      <u-text-value-dashed v-if="billing.country">
        <template v-slot:label>
          <small>{{ $t("global.commons.country") }}</small>
        </template>

        <flag :iso="billing.country" :squared="false" class="me-1" />
        {{ getCountryName(billing.country) }}
      </u-text-value-dashed>

      <u-text-value-dashed v-if="billing.state">
        <template v-slot:label>
          <small>{{ $t("global.commons.state") }}</small>
        </template>

        {{ billing.state }}
      </u-text-value-dashed>

      <u-text-value-dashed v-if="billing.address">
        <template v-slot:label>
          <small>{{ $t("global.commons.address") }}</small>
        </template>

        {{ billing.address }}
      </u-text-value-dashed>
    </template>
  </div>
</template>

<script>
import UTextValueDashed from "../../../../ui/text/value-dashed/UTextValueDashed.vue";

export default {
  name: "SOrderBillCard",
  components: { UTextValueDashed },
  props: {
    basket: {
      require: true,
      type: Object,
    },
    billing: {
      require: true,
      type: Object,
    },
  },

  computed: {
    delivery_price() {
      return this.basket.delivery_price;
    },

    final_price() {
      return (
        this.total_price +
        (this.basket.tax_included ? 0 : this.tax) +
        this.tax_shipping
      );
    },

    tax_shipping() {
      return this.basket.tax_shipping ? this.basket.tax_shipping : 0;
    },

    tax() {
      return this.basket.tax ? this.basket.tax : 0;
    },

    total_price() {
      return this.basket.price;
    },

    total_discount() {
      return this.basket.discount;
    },
  },
};
</script>

<style scoped></style>
