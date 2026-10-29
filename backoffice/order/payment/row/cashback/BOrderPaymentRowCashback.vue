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
  <!------------ Cashback ------------>
  <tr v-if="cashback_order" class="text-start" :class="{ 'b-order-payment-cashback--modern': modern }">
    <td>
      <img
        class="mx-2"
        height="24"
        src="@selldone/components-vue/assets/icons/cashback-outline.svg"
        width="24"
      />
      {{ $t("global.commons.cashback") }}
    </td>
    <td class="text-left">
      <u-price
        :amount="cashback_order.amount_cashback"
        :currency="cashback_order.currency"
      ></u-price>
    </td>
    <td>
      <p>{{ cashback?.title }}</p>
      <p class="text-muted m-0 single-line">
        {{ cashback?.description }}
      </p>
    </td>
    <td :class="modern ? 'text-start' : 'text-center'">
      <v-btn
        v-if="!readonly && cashback"
        size="x-small"
        target="_blank"
        class="tnt"
        :class="{ 'sd-modern-button sd-modern-button--compact sd-modern-button--inline': modern }"
        :color="modern ? 'primary' : undefined"
        :variant="modern ? 'text' : undefined"
        :to="{
          name: 'BPageCashbackDashboard',
          params: { cashback_id: cashback.id },
        }"
        :append-icon="modern ? 'north_east' : 'launch'"
      >
        {{ $t("global.commons.cashback") }}
      </v-btn>
    </td>
  </tr>
</template>

<script lang="ts">
export default {
  name: "BOrderPaymentRowCashback",
  components: {},
  emits: ["payment-captured"],
  props: {
    readonly: Boolean,
    order: Object,
    modern: { type: Boolean, default: false },
  },

  data: function () {
    return {};
  },
  computed: {
    cashback_order() {
      return this.order?.cashback_order;
    },
    cashback() {
      return this.cashback_order?.cashback;
    },
  },
  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
.b-order-payment-cashback--modern .single-line {
  white-space: normal !important;
  overflow-wrap: anywhere;
}
</style>
