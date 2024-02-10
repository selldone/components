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
    <s-value-dashed>
      <template v-slot:label>
        <small>{{ $t("global.basket_order_info_summery.total_price") }}</small>
      </template>

      <price-view
        :amount="total_price + total_discount"
        :currency="basket.currency"
      ></price-view>
    </s-value-dashed>

    <!-- ------------------------ Discount ------------------------ -->
    <s-value-dashed>
      <template v-slot:label>
        <small>{{ $t("global.commons.discount") }}</small>
      </template>

      <price-view
        :amount="-total_discount"
        :currency="basket.currency"
      ></price-view>
    </s-value-dashed>

    <!-- ------------------------ Delivery price ------------------------ -->
    <s-value-dashed>
      <template v-slot:label>
        <small>{{ $t("global.commons.shipping") }}</small>
      </template>

      <price-view
        v-if="delivery_price > 0"
        :amount="delivery_price"
        :currency="basket.currency"
      ></price-view>
      <span v-else-if="delivery_price === 0">{{
        $t("global.commons.free")
      }}</span>
      <span v-else-if="delivery_price === -1">{{
        $t("global.commons.sod")
      }}</span>
    </s-value-dashed>

    <!-- ------------------------ Tax ------------------------ -->
    <s-value-dashed v-if="tax">
      <template v-slot:label>
        <small>{{ $t("global.commons.tax") }}</small>
      </template>

      <price-view :amount="tax" :currency="basket.currency"></price-view>

      <span v-if="basket.tax_included">{{
        $t("global.commons.tax_included")
      }}</span>
    </s-value-dashed>

    <!-- ------------------------ Tax Shipping  ------------------------ -->
    <s-value-dashed v-if="tax_shipping">
      <template v-slot:label>
        <small>{{ $t("global.commons.tax_shipping") }}</small>
      </template>

      <price-view
        :amount="tax_shipping"
        :currency="basket.currency"
      ></price-view>
    </s-value-dashed>

    <!-- ------------------------ Final Price ------------------------ -->
    <s-value-dashed>
      <template v-slot:label>
        <small>{{ $t("global.basket_order_info_summery.final_price") }}</small>
      </template>

      <price-view
        :amount="final_price"
        :currency="basket.currency"
        class="text-success"
        large
      ></price-view>
    </s-value-dashed>

    <!-- ------------------------ Billing Info ------------------------ -->

    <template v-if="billing">
      <hr>

      <s-value-dashed>
        <template v-slot:label>
          <small>{{ $t("global.commons.kind") }}</small>
        </template>

        <v-icon class="me-1">{{
          billing.business ? "business" : "person"
        }}</v-icon>
        {{
          billing.business
            ? $t("global.commons.business")
            : $t("global.commons.personal")
        }}
      </s-value-dashed>

      <!-- ------------------------ Tax ID ------------------------ -->
      <s-value-dashed v-if="billing.tax_id">
        <template v-slot:label>
          <small> Tax ID</small>
        </template>

        {{ billing.tax_id }}
      </s-value-dashed>

      <s-value-dashed v-if="billing.name">
        <template v-slot:label>
          <small> {{ $t("global.commons.name") }}</small>
        </template>

        {{ billing.name }}
      </s-value-dashed>

      <s-value-dashed v-if="billing.country">
        <template v-slot:label>
          <small>{{ $t("global.commons.country") }}</small>
        </template>

        <flag :iso="billing.country" :squared="false" class="me-1" />
        {{ getCountryName(billing.country) }}
      </s-value-dashed>

      <s-value-dashed v-if="billing.state">
        <template v-slot:label>
          <small>{{ $t("global.commons.state") }}</small>
        </template>

        {{ billing.state }}
      </s-value-dashed>

      <s-value-dashed v-if="billing.address">
        <template v-slot:label>
          <small>{{ $t("global.commons.address") }}</small>
        </template>

        {{ billing.address }}
      </s-value-dashed>
    </template>
  </div>
</template>

<script>
import SValueDashed from "@components/ui/text/SValueDashed.vue";
export default {
  name: "SOrderBillCard",
  components: { SValueDashed },
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
