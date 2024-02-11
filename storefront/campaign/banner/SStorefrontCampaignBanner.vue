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
  <v-expand-transition>
    <v-banner
      v-if="
        !close &&
        banner &&
        banner.message &&
        !(
          $route.name === window.$storefront.routes.PAGE_RENDER &&
          $route.params.page_name === banner.page_name
        )
      "
      :class="{ '-bg-repeat': banner.repeat }"
      :dark="banner.dark"
      :style="{
        'background-color': banner.bg,
        'background-image': `url(${banner.bg_image})`,
      }"
      class="s--storefront-top-banner"
      single-line
    >
      <template v-slot:icon>
        <v-avatar v-if="banner.icon" :color="banner.icon_bg" size="40">
          <v-icon>
            {{ banner.icon }}
          </v-icon>
        </v-avatar>
      </template>

      <router-link
        :class="{ pen: developerMode }"
        :to="
          banner.page_name
            ? {
                name: window.$storefront.routes.PAGE_RENDER,
                params: { page_name: banner.page_name },
              }
            : {}
        "
        class="flex-grow-1"
      >
        <div v-html="banner.message"></div>
      </router-link>

      <template v-slot:actions>
        <s-lottie
          :height="banner.anim_height"
          :options="{ path: banner.anim, loop: true }"
          :speed="1"
          :width="banner.anim_width"
          class="mx-1 flex-grow-0"
        />
        <v-btn class="mx-1 flex-grow-0" icon @click.stop="dismiss">
          <v-icon>close</v-icon>
        </v-btn>
      </template>
    </v-banner>
  </v-expand-transition>
</template>

<script>
export default {
  name: "SStorefrontCampaignBanner",

  props: {
    shop: {
      type: Object,
    },
    bannerPreview: {
      type: Object,
    },

    developerMode: {
      type: Boolean,
      require: false,
      default: false,
    },
  },

  data: () => ({
    close: false,
  }),

  computed: {
    campaign() {
      return this.shop?.campaign;
    },
    banner() {
      if (this.developerMode) return this.bannerPreview;
      return this.campaign ? this.campaign.banner : null;
    },
  },
  created() {
    /**
     * We set the banner status in the store state, to inform other components (like layout) the banner is showing or not)
     */
    if (!this.developerMode)
      this.$store.commit("setShopMainBanner", this.banner);
  },
  watch: {
    banner() {
      if (!this.developerMode)
        this.$store.commit("setShopMainBanner", this.banner);
    },
  },
  methods: {
    dismiss() {
      this.close = true;
      if (!this.developerMode) this.$store.commit("setShopMainBanner", null);
    },
  },
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
html {
  --s--top-banner-heigh: 64px;
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--storefront-top-banner {
  z-index: 100;
  height: var(--s--top-banner-heigh);
  text-align: start;

  a {
    color: currentColor !important;
  }

  &.-bg-repeat {
    background-repeat: repeat;
  }
}
</style>
