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
  <div
    :class="{
      'd-flex text-start align-center': horizontal,
      'text-center': !horizontal,
    }"
  >
    <span
      v-if="card && image.startsWith('<svg')"
      class="mx-auto d-block flex-grow-0"
      :title="card.brand"
      style="width: 24px; height: auto"
      v-html="image"
    />
    <img
      v-else-if="card"
      :src="image"
      height="24"
      class="mx-auto d-block flex-grow-0"
      :title="card.brand"
    />

    <!-- Blockchain -->

    <div v-if="card && card.blockchain" dir="ltr" class="m-1 flex-grow-1">
      <span class="d-block subtitle-2"> {{ card.network }}</span>

      <div class="d-flex subtitle-2">
        <div class="w-50" title="Address balance">
          <price-view
            :amount="card.balance"
            :currency="currency"
            not-show-zero
          ></price-view>
        </div>
        <div class="w-50" title="Network fee">
          <price-view
            :amount="card.fee"
            :currency="currency"
            not-show-zero
          ></price-view>
        </div>
      </div>

      <span
        v-if="card.sender"
        class="d-block limited-text-150px m-auto"
        :title="'Sender address: ' + card.sender"
      >
        <v-icon small class="mr-2"> alternate_email </v-icon>
        <small class="hover-b pp" v-copy>{{ card.sender }}</small>
      </span>

      <span
        v-if="card.hash"
        class="d-block limited-text-150px m-auto"
        :title="'Transaction hash: ' + card.hash"
      >
        <v-icon small class="mr-2"> tag </v-icon>
        <small class="hover-b pp" v-copy>{{ card.hash }}</small>
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
        <v-icon small class="mx-2"> lock </v-icon>
      </div>
      <!--
      <div v-if="card.bank" title="Bank" class="my-1">
        {{card.bank}}
      </div>-->
    </div>

    <!-- Not available -->

    <i v-else class="m-1 small text-muted">
      <v-icon small class="me-1">credit_card_off</v-icon>
      {{
      $t("global.commons.no_credit_card_info")
    }}</i>
  </div>
</template>

<script>
import { Cards } from "@core/enums/payment/Cards";
import SVGs from "@core/enums/payment/stripe/SVGs";

export default {
  name: "PaymentCard",

  data: function () {
    return {};
  },
  props: {
    method:{}, // String , method code (optional)
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
