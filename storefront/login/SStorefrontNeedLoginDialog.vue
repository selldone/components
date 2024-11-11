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
    width="640"
    content-class="s--storefront-need-login-dialog"
    max-width="98vw"
    persistent
    scrollable
    :class="{ pen: busy_user }"
  >
    <v-btn
      class="absolute-top-end m-3 z2"
      icon
      variant="text"
      @click="show_dialog = false"
    >
      <v-icon>close</v-icon>
    </v-btn>

    <s-shop-login
      v-model:show="show_dialog"
      :color="ThemeColorDeepDark"
      class="rounded-0"
    ></s-shop-login>

    <div
      v-if="busy_user"
      class="d-flex align-center justify-center"
      style="
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background-color: #aaaaaa44;
        backdrop-filter: blur(6px);
      "
    >
      <span class="text-h3 font-weight-thin" style="color: #fff">
        {{ $t("global.commons.waiting") }}
      </span>
    </div>
  </v-bottom-sheet>
</template>

<script lang="ts">
import SShopLogin from "../../storefront/login/SShopLogin.vue";
import { throttle } from "lodash-es";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import {EventBus} from "@selldone/core-js/events/EventBus.ts";

export default {
  name: "SStorefrontNeedLoginDialog",
  mixins: [TemplateMixin],

  components: { SShopLogin },
  inject: ["$shop"],
  props: {},

  data: () => ({
    show_dialog: false,
  }),
  computed: {
    busy_user() {
      return this.$store.getters.getBusyUser;
    },
  },
  watch: {
    show_dialog(val) {
      this.$store.commit("setForceHideNavigation", val);
    },
  },
  created() {
    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Event Bus ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████

    EventBus.$on(
      "need-login",
      throttle((show) => {
        this.show_dialog = show;
      }, 800),
    );
  },

  methods: {},
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--storefront-need-login-dialog {
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
