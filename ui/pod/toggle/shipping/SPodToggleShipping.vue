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
      <swiper :options="{ loop: true, autoplay: { delay: 2500 } }">
        <swiper-slide v-for="(k, i) in shippings" :key="i">
          <img :src="k" height="42" width="42" />
        </swiper-slide>
      </swiper>
    </div>
    <v-icon class="my-2" color="#333">local_shipping</v-icon>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";

export default {
  name: "SPodToggleShipping",
  components: { Swiper, SwiperSlide },

  data: () => ({
    shippings: [
      require("@app-selldone/home/assets/shippings/Asendia.svg"),
      require("@app-selldone/home/assets/shippings/CDL.svg"),
      require("@app-selldone/home/assets/shippings/DHL.svg"),
      require("@app-selldone/home/assets/shippings/FedEx.svg"),
      require("@app-selldone/home/assets/shippings/Shipbob.svg"),
      require("@app-selldone/home/assets/shippings/UPS.svg"),
      require("@app-selldone/home/assets/shippings/USPS.svg"),
    ],
  }),
};
</script>

<style scoped></style>
