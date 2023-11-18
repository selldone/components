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
  <v-bottom-sheet
    v-model="show_dialog"
    inset
    :max-width="640"
    width="90%"
    scrollable
    content-class="login-container"
    persistent
  >
    <v-btn icon class="absolute-top-end m-3 z2" @click="show_dialog = false"
      ><v-icon>close</v-icon></v-btn
    >

    <s-shop-login
      :show.sync="show_dialog"
      :color="SaminColorDarkDeep"
      class="rounded-0"
    ></s-shop-login>
  </v-bottom-sheet>
</template>

<script>
import SShopLogin from "@components/login/SShopLogin.vue";
import _ from "lodash-es";
export default {
  name: "SNeedLoginDialog",
  components: { SShopLogin },
  data: () => ({
    show_dialog: false,
  }),
  computed: {},
  watch: {},
  created() {
    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Event Bus ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████

    this.EventBus.$on(
      "need-login",
      _.throttle((show) => {
        this.show_dialog = show;
      }, 800)
    );
  },

  methods: {},
};
</script>

<style lang="scss">
.login-container {
  bottom: 5vh;
  position: relative;
  border-radius: 52px !important;
  overflow: hidden !important;

  @media only screen and (max-width: 960px) {
    bottom: 0;
    border-radius: 32px 32px 0 0 !important;
  }
}
</style>
