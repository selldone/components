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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
    <v-toolbar
      v-if="!$store.getters.getIsNative && $shop"
      :class="{ 'text-white': is_dark, '-dark': is_dark }"
      :color="HEADER_COLOR"
      :extended="!overlay"
      :style="{
        marginTop: overlay ? '64px' : 0 /*Cover -64px of main view of shop*/,
      }"
      :theme="is_dark ? 'dark' : 'light'"
      class="s--storefront-primary-header px-2"
      extension-height="64px"
      flat
    >
      <template v-slot:extension>
        <div v-if="!overlay" style="min-height: 64px"></div>
      </template>

      <!-- ―――――――――― Navigation drawer (Mobile & Instance app) : Action ―――――――――― -->
      <s-header-section-drawer-menu
        v-if="isMobile || isStandalone"
      ></s-header-section-drawer-menu>

      <s-header-section-logo class="mx-1"></s-header-section-logo>

      <v-spacer />

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Lottery ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <s-storefront-lottery-wheel-of-fortune
        class="fadeIn delay_200 me-3"
      ></s-storefront-lottery-wheel-of-fortune>

      <s-header-section-buttons :dark="!is_light_header">
      </s-header-section-buttons>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ User ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <s-header-section-user v-if="!isMobile" :dark="!is_light_header">
      </s-header-section-user>
    </v-toolbar>
  </div>
</template>

<script lang="ts">
import SHeaderSectionLogo from "../../../storefront/header/section/logo/SHeaderSectionLogo.vue";
import SHeaderSectionDrawerMenu from "@selldone/components-vue/storefront/header/section/drawer-menu/SHeaderSectionDrawerMenu.vue";
import SHeaderSectionButtons from "@selldone/components-vue/storefront/header/section/buttons/SHeaderSectionButtons.vue";
import { ThemeHelper } from "@selldone/core-js";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import { defineAsyncComponent } from "vue";

export default {
  name: "SHeaderSection",
  mixins: [TemplateMixin],
  components: {
    SHeaderSectionUser: defineAsyncComponent(
      () =>
        import(
          "@selldone/components-vue/storefront/header/section/user/SHeaderSectionUser.vue"
        ),
    ),

    SStorefrontLotteryWheelOfFortune: defineAsyncComponent(
      () =>
        import(
          "../../../storefront/lottery/wheel-of-fortune/SStorefrontLotteryWheelOfFortune.vue"
        ),
    ),

    SHeaderSectionButtons,
    SHeaderSectionDrawerMenu,
    SHeaderSectionLogo,
  },
  inject: ["$shop"],
  props: {
    overlay: { type: Boolean, default: false },
    overlayDark: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    // Dynamic header style:
    transparentHeader: null,
    darkHeader: null,
  }),

  computed: {
    user() {
      return this.$store.getters.getUser;
    },
    profile() {
      return this.user && this.user.profile;
    },

    transparent_header() {
      return this.$route.matched.some(
        (record) => record.meta.transparent_header,
      );
    },
    card() {
      // show card shadow on main route view
      return this.$route.matched.some((record) => record.meta.card);
    },

    campaign() {
      return this.$shop ? this.$shop.campaign : null;
    },

    banner() {
      return this.campaign ? this.campaign.banner : null;
    },

    theme() {
      if (!this.$shop) return null;
      return this.$shop.theme;
    },

    is_dark() {
      return this.overlay
        ? this.overlayDark
        : !this.transparent_header && !this.is_light_header;
    },
    // --------------------------------------------------------------------------------

    is_light_header() {
      if (this.overlay) return !this.overlayDark;

      return (
        this.$route.matched.some((record) => record.meta.light_header) ||
        this.theme?.light_header !== false // Default theme header is light!
      );
    },

    // --------------------------------------------------------------------------------

    logo() {
      if (this.theme && this.theme.logo)
        return this.getShopImagePath(this.theme.logo);

      return this.getShopImagePath(this.$shop.icon, 128);
    },

    title() {
      return this.theme &&
        this.theme.title !== null &&
        this.theme.title !== undefined
        ? this.theme.title
        : this.$shop.title;
    },

    HEADER_COLOR() {
      return this.globalStyle.header_color
        ? this.globalStyle.header_color
        : this.transparent_header || this.overlay
          ? "transparent"
          : this.is_light_header
            ? "var(--background)"
            : this.ThemeColorDark;
    },

    globalStyle() {
      return this.$store.getters.getGlobalStyle;
    },
  },

  watch: {
    $route(to, from) {
      if (
        this.$route.name !== window.$storefront.routes.PAGE_RENDER &&
        this.$route.name !== "CustomHomePage" &&
        this.$route.name !== window.$storefront?.routes.INCLUDE_PAGE_RENDER
      ) {
        this.transparentHeader = null;
        this.darkHeader = null; // Default value is null!
      }
    },

    HEADER_COLOR(color) {
      // We try to set header color to meta theme color (for iphone)
      ThemeHelper.SetMetaThemeColor(color);
    },
  },

  created() {
    ThemeHelper.SetMetaThemeColor(this.HEADER_COLOR);
  },

  mounted() {},
  beforeUnmount() {},

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

.s--storefront-primary-header {
  overflow-x: auto;
  overflow-y: hidden;
  border-bottom: 1px solid rgba(10, 10, 10, 0.3) !important;

  &.-dark {
    border-bottom: 1px solid rgba(222, 226, 230, 0.3) !important;
  }
}
</style>
