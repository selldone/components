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
    :class="{
      'd-flex text-start align-center': horizontal,
      'text-center': !horizontal,
    }"
  >
    <span
      v-if="card && image.startsWith('<svg')"
      :title="card.brand"
      class="mx-auto d-block flex-grow-0"
      style="width: 24px; height: auto"
      v-html="image"
    />
    <img
      v-else-if="card"
      :src="image"
      :title="card.brand"
      class="mx-auto d-block flex-grow-0"
      height="24"
    />

    <!-- Blockchain -->

    <div v-if="card && card.blockchain" class="m-1 flex-grow-1" dir="ltr">
      <span class="d-block text-subtitle-2"> {{ card.network }}</span>

      <div class="d-flex text-subtitle-2">
        <div class="w-50" title="Address balance">
          <u-price
            :amount="card.balance"
            :currency="currency"
            not-show-zero
          ></u-price>
        </div>
        <div class="w-50" title="Network fee">
          <u-price
            :amount="card.fee"
            :currency="currency"
            not-show-zero
          ></u-price>
        </div>
      </div>

      <span
        v-if="card.sender"
        :title="'Sender address: ' + card.sender"
        class="d-block limited-text-150px ma-auto"
      >
        <v-icon class="me-2" size="small"> alternate_email </v-icon>
        <small v-copy class="hover-b pp">{{ card.sender }}</small>
      </span>

      <span
        v-if="card.hash"
        :title="'Transaction hash: ' + card.hash"
        class="d-block limited-text-150px ma-auto"
      >
        <v-icon class="me-2" size="small"> tag </v-icon>
        <small v-copy class="hover-b pp">{{ card.hash }}</small>
      </span>
    </div>

    <!-- Traditional payment -->

    <div v-else-if="card" class="m-1 flex-grow-1">
      <div>
        <flag
          v-if="showCountry && card.country"
          :iso="card.country"
          :squared="false"
          class="me-1"
        />

        <span dir="ltr">{{ card.card_no }}</span>
        <v-icon class="mx-2" size="small"> lock</v-icon>
      </div>
      <!--
      <div v-if="card.bank" title="Bank" class="my-1">
        {{card.bank}}
      </div>-->
    </div>

    <!-- Not available -->

    <i v-else class="m-1 small text-muted">
      <v-icon class="me-1" size="small">credit_card_off</v-icon>
      {{ $t("global.commons.no_credit_card_info") }}</i
    >
  </div>
</template>

<script>
import { Cards } from "@selldone/core-js/enums/payment/Cards.ts";
import SVGs from "@selldone/core-js/enums/payment/stripe/SVGs.js";

export default {
  name: "UPaymentCard",

  data: function () {
    return {};
  },
  props: {
    method: {}, // String , method code (optional)
    store: {}, // Can be appstore or google play for in app purchases!
    card: {},
    horizontal: {
      type: Boolean,
      default: false,
    },
    showCountry: {
      type: Boolean,
      default: false,
    },
    currency: {},
  },
  computed: {
    image() {
      // In-app purchase:
      if (this.store?.toLowerCase() === "appstore")
        return require("@components/assets/trademark/apple-b.svg");
      else if (this.store?.toLowerCase() === "googleplay")
        return require("@components/assets/trademark/googleplay.svg");

      if (this.card && this.card.blockchain)
        return require("@components/assets/icons/blockchain.svg");

      if (!this.card.brand) return Cards.card;

      let out = Cards[this.card.brand.toLowerCase()];

      if (!out) {
        // Try to find in SVGs repository:
        out = SVGs[this.card.brand.toLowerCase()];
      }

      // Try to find by method:
      if (!out && this.method) {
        out = Cards[this.method.toLowerCase()];
      }
      if (!out && this.method) {
        out = SVGs[this.method.toLowerCase()];
      }

      return out ? out : Cards.card;
    },
  },
};
</script>

<style scoped></style>
