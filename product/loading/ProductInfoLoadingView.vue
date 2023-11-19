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
  <v-container fluid class="vue-content-placeholders">
    <v-layout row wrap fill-height>
      <!--  ---------------------------- Images ---------------------------- -->

      <v-flex
        xs12
        lg5
        justify-center
        class="image-gallery-root border-end-grater-xl "
        style="min-height: 580px"
      >
        <!-- swiper1 -->
        <div class="image-sprite" style="height: 80%" />

        <!-- swiper2 Thumbs -->
        <v-container fluid style="height: 20%" p-2>
          <v-layout row wrap align-center justify-center fill-height>
            <v-flex xs3 class="image-sprite" />
            <v-flex xs3 class="image-sprite" />
            <v-flex xs3 class="image-sprite" />
          </v-layout>
        </v-container>
      </v-flex>

      <!--  ---------------------------- Info ---------------------------- -->

      <v-flex xs12 lg7 class="text-right pr-md-4 pl-md-4 pr-sm-2 pl-sm-2">
        <h1 class="text-right mt-2 pr-2 pl-2 text-sprite big" />
        <p class="text-muted pr-2 pl-2 text-sprite small" />

        <v-btn depressed />

        <hr />
        <v-container fluid class="pt-0 pb-0">
          <v-layout row wrap>
            <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Section 1 ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
            <v-flex xs12 sm6 md7 lg8>
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
            </v-flex>

            <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Section 2 ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
            <v-flex xs12 sm6 md5 lg4 class="pr-3 pl-2">
              <p class="text-sprite small" />
              <p class="text-sprite small" />
              <p class="text-sprite small" />
              <p class="text-sprite small" />
              <p class="text-sprite small" />
            </v-flex>

            <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Seller Options ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
            <v-flex xs12 />
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
    <slot></slot>
  </v-container>
</template>

<script>
export default {
  name: "ProductInfoLoadingView",
  components: {},
  props: {},
  data: () => ({}),

  computed: {},
  watch: {},
  created() {},

  mounted() {},

  destroyed() {},

  methods: {}
};
</script>

<style scoped lang="scss">
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
