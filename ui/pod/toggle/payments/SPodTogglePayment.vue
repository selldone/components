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
  <div class="pod-toggle">
    <div class="-nut">
      <swiper :options="{ loop: true, autoplay: { delay: 2700 } }">
        <swiper-slide v-for="k in payment_keys" :key="k">
          <span v-html="SVGs[k]"></span>
        </swiper-slide>
      </swiper>
    </div>
    <v-icon class="my-2" color="#333">payment</v-icon>
  </div>
</template>

<script>
import SVGs from "@core/enums/payment/stripe/SVGs";
import { Swiper, SwiperSlide } from "swiper/vue";

export default {
  name: "SPodTogglePayment",
  components: { Swiper, SwiperSlide },

  data: () => ({
    payment_keys: [
      "apple_pay",
      "google_pay",
      "afterpay_clearpay",
      "alipay",
      "eps",
      "ideal",
      "giropay",
      "klarna",
      "oxxo",
      "p24",
      "sepa_debit",
      "sofort",
      "grabpay",
      "wechat",
    ],
    SVGs: SVGs,
  }),
};
</script>

<style scoped></style>
