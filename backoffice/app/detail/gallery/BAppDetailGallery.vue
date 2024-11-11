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
  <swiper
    :grabCursor="true"
    :loop="false"
    :materialEffect="{
      slideSplitRatio: 0.65,
    }"
    :modules="modules"
    :slidesPerView="slidesPerView"
    :spaceBetween="16"
    :speed="600"
    effect="material"
    style="height: 600px"
  >
    <swiper-slide v-for="image in images" :key="image.path">
      <!-- Wrap each slide content with "swiper-material-wrapper" and "swiper-material-content" elements -->

      <div class="swiper-material-wrapper">
        <div class="swiper-material-content">
          <!-- Use data-swiper-material-scale to add scale effect on required elements -->

          <v-img
            :src="getShopImagePath(image.path)"
            aspect-ratio="1"
            class="swiper-slide pointer-zoom-in mx-2"
            cover
            data-swiper-material-scale="1.25"
            height="100%"
            @click="showFullscreen"
          >
            <template v-slot:placeholder>
              <v-progress-circular
                class="center-absolute"
                color="#eee"
                indeterminate
              />
            </template>
          </v-img>

          <!-- Use swiper-material-animate-opacity class to add opacity animation on required elements -->
          <!--<span class="demo-material-label swiper-material-animate-opacity">{{
            image
          }}</span>-->
        </div>
      </div>
    </swiper-slide>
  </swiper>
</template>

<script lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import EffectMaterial from "../../../../ui/swiper/effects/material/effect-material.esm.js";
import "../../../../ui/swiper/effects/material/effect-material.scss";

// Import Swiper styles
import "swiper/css";
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default {
  name: "BAppDetailGallery",
  components: { Swiper, SwiperSlide },
  props: {
    app: {
      required: true,
      type: Object,
    },
    dark: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    modules: [Autoplay, Navigation, Pagination, EffectMaterial],
  }),

  computed: {
    images() {
      return this.app.images;
    },
    slidesPerView() {
      return this.$vuetify.display.xs
        ? 1
        : this.$vuetify.display.smAndDown
          ? 2
          : 3;
    },
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {},
};
</script>

<style scoped></style>
