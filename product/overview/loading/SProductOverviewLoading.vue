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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-container style="--hr-color:#efefef;" fluid>
    <v-row >
      <!--  ---------------------------- Images ---------------------------- -->

      <v-col
        class="image-gallery-root border-end-grater-xl d-flex justify-center"
        lg="5"
        style="min-height: 580px"
        cols="12"
      >
        <!-- swiper2 Thumbs -->
        <div style="width: 20%" class="d-flex flex-column mt-1 me-2 align-center">
            <v-card flat color="#eee"  class=" ratio-1-1 mb-3" rounded="lg" width="64" />
            <v-card flat color="#eee" class=" ratio-1-1 mb-3"  rounded="lg" width="64" />
            <v-card flat color="#eee" class=" ratio-1-1 mb-3"  rounded="lg"  width="64" />
          <v-spacer></v-spacer>
        </div>

        <!-- swiper1 -->
        <div class="image-sprite" style="width: 80%" />


      </v-col>

      <!--  ---------------------------- Info ---------------------------- -->

      <v-col class="text-right pr-md-4 pl-md-4 pr-sm-2 pl-sm-2" lg="7" cols="12">
        <h1 class="text-right mt-2 pr-2 pl-2 text-sprite big" />
        <p class="text-muted pr-2 pl-2 text-sprite small" />

        <v-btn variant="flat" />

        <hr />
        <v-container class="pt-0 pb-0" fluid>
          <v-row  >
            <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Section 1 ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
            <v-col lg="8" md="7" sm="6" cols="12" >
              <p class="pr-2 text-sprite small" />

              <p class="pr-2 text-sprite" style="min-height: 1rem" />

              <hr />

              <p class="pr-2 text-sprite" style="max-width: 30%" />

              <!--  💡 Product Variants -->

              <hr />

              <p class="text-sprite small" />
              <p class="text-sprite small" />
              <p class="text-sprite small" />

              <!-- 🞇 Price -->

              <hr />

              <p class="text-sprite big" style="max-width: 50%" />

              <!--
                  █████████████████████████████████████████████████████████████
                  ―――――――――――――――――――――――― Buy Button ―――――――――――――――――――――――
                  █████████████████████████████████████████████████████████████
                  -->
            </v-col>

            <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Section 2 ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
            <v-col class="pr-3 pl-2" lg="4" md="5" sm="6" cols="12">
              <p class="text-sprite small" />
              <p class="text-sprite small" />
              <p class="text-sprite small" />
              <p class="text-sprite small" />
              <p class="text-sprite small" />
            </v-col>

          </v-row>
        </v-container>
      </v-col>
    </v-row>
    <slot></slot>
  </v-container>
</template>

<script>
export default {
  name: "SProductOverviewLoading",
  components: {},
  props: {},
  data: () => ({}),

  computed: {},
  watch: {},
  created() {},

  mounted() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
.image-sprite {
  background-color: #eee;
  border-radius: 8px;
  height: 100%;
  margin: 4px;
  width: calc(100% - 8px);

  animation: lds-ripple 3s cubic-bezier(0, 0.2, 0.8, 1) infinite;

  &:nth-child(2n) {
    animation-delay: -0.2s;
  }

  &:nth-child(2n + 1) {
    animation-delay: -0.5s;
  }

  &:nth-child(3n) {
    animation-delay: -0.8s;
  }

  &:nth-child(5n) {
    animation-delay: -1s;
  }

  &:nth-child(7n) {
    animation-delay: -1.3s;
  }

  &.small {
  }
}

.text-sprite {
  background-color: #eee;
  border-radius: 2px;
  width: 100%;
  height: 32px;

  animation: lds-ripple 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;

  &:nth-child(2n) {
    animation-delay: -0.2s;
  }

  &:nth-child(2n + 1) {
    animation-delay: -0.5s;
  }

  &:nth-child(3n) {
    animation-delay: -0.8s;
  }

  &:nth-child(5n) {
    animation-delay: -1s;
  }

  &:nth-child(7n) {
    animation-delay: -1.3s;
  }

  &.big {
    height: 64px;
  }

  &.small {
    height: 24px;
  }
}

@keyframes lds-ripple {
  0% {
    background-color: #eee;
  }
  50% {
    background-color: #fafafa;
  }
  100% {
    background-color: #eee;
  }
}
</style>
