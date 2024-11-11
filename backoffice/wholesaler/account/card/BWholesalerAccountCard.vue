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
  <div style="height: 100%" @click="$emit('select', account)">
    <s-widget
      :class="[small ? 'm-1' : '', dark ? 'widget-dark' : '']"
      :style="`background: ${color}`"
      :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-green mr-sm' style='font-size: 6px;'></span>  ${title}  </h5>`"
      body-class="p-0 mt"
      class="text-start widget-hover pointer-pointer"
      custom-header
      style="border-radius: 24px; min-height: 160px; height: inherit"
    >
      <template v-slot:top-left>
        <u-currency-icon
          :currency="currency"
          :small="small"
          flag
          gradient
        ></u-currency-icon>
      </template>

      <u-price
        :amount="account.charge"
        :class="{ 'text-danger': account.balance < 0 }"
        :currency="account.currency"
        class="m-2"
        x-large
      ></u-price>

      <div class="d-flex mt-2 border-between text-center">
        <div class="flex-grow-1 p-1 small">
          <small class="d-block">{{ $t("global.commons.create_date") }}</small>
          {{ getLocalTimeString(account.created_at) }}
        </div>

        <div class="flex-grow-1 p-1 small">
          <small class="d-block">{{ $t("global.commons.update_date") }}</small>
          {{ getLocalTimeString(account.updated_at) }}
        </div>
      </div>
    </s-widget>
  </div>
</template>

<script lang="ts">
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";

export default {
  name: "BWholesalerAccountCard",
  components: { UCurrencyIcon },
  emits: ["select"],
  props: {
    account: {
      required: true,
      type: Object,
    },

    dark: {
      required: false,
      default: false,
      type: Boolean,
    },
    color: {
      required: false,
      default: "white",
      type: String,
    },

    small: {
      required: false,
      default: false,
      type: Boolean,
    },
    extended: {
      required: false,
      default: false,
      type: Boolean,
    },
    iconColor: {
      required: false,
      type: String,
      default: "#333",
    },
    active: {
      required: false,
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {};
  },
  computed: {
    currency() {
      return Currency[this.account.currency];
    },

    title() {
      return this.getCurrencyName(this.account.currency);
    },
  },
  created() {},
  mounted() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.account-name {
  font-weight: 600;
  font-size: 1.2em;
}

.float-numbers {
  font-size: 0.8em;
  opacity: 0.7;
}
</style>
