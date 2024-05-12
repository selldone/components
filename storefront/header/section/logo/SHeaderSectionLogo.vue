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
  <div class="d-inline-flex align-center">
    <component
      :is="logo_custom_size ? 'router-link' : 'v-btn'"
      :to="
        viewOnly
          ? {}
          : {
              name:
                getCustomHomePage() && !in_custom_home_page
                  ? getCustomHomePage()
                  : 'ShopPage',
            }
      "
      class="mx-1 zoomIn"
      icon
    >
      <img
        v-if="logo_custom_size"
        :height="theme.logo_h"
        :src="logo"
        :width="theme.logo_w"
        style="object-fit: contain"
      />
      <v-avatar
        v-else
        :size="in_custom_home_page ? 26 : 36"
        :tile="in_custom_home_page"
        class="pointer-pointer hover-scale-small force-top"
        color="transparent"
      >
        <v-img
          :src="
            in_custom_home_page
              ? is_light_header
                ? require('../../../../assets/icons/basket.svg')
                : require('../../../../assets/icons/basket-w.svg')
              : logo
          "
          alt="Shop"
          style="transition: none"
        />
      </v-avatar>
    </component>

    <template v-if="shop && $vuetify.display.smAndUp">
      <span
        v-if="isMobile"
        class="z2 ms-2 font-weight-bold zoomIn d-block single-line"
        style="font-size: 22px"
        @click="goToShopInfoPage()"
      >
        {{ title }}
      </span>
      <router-link
        v-else
        :to="
          viewOnly
            ? {}
            : {
                name:
                  getCustomHomePage() && !in_custom_home_page
                    ? getCustomHomePage()
                    : 'ShopPage',
              }
        "
        class="z2 ms-2 font-weight-bold zoomIn"
        style="font-size: 22px; color: currentColor"
      >
        {{ title }}
      </router-link>
    </template>
  </div>
</template>

<script>
export default {
  name: "SHeaderSectionLogo",
  components: {},
  props: {
    shop: { required: true },
    viewOnly: { default: false, type: Boolean },
  },
  data: () => ({}),

  computed: {
    theme() {
      if (!this.shop) return null;
      return this.shop.theme;
    },

    // --------------------------------------------------------------------------------

    is_light_header() {
      return (
        this.$route.matched.some((record) => record.meta.light_header) ||
        (this.theme && this.theme.light_header)
      );
    },

    // --------------------------------------------------------------------------------

    logo() {
      if (this.theme && this.theme.logo)
        return this.getShopImagePath(this.theme.logo);

      return this.getShopImagePath(this.shop.icon, 128);
    },
    logo_custom_size() {
      return (
        this.theme &&
        this.logo &&
        ((this.theme.logo_w && this.theme.logo_w !== "unset") ||
          (this.theme.logo_h && this.theme.logo_h !== "unset"))
      );
    },

    title() {
      return this.theme &&
        this.theme.title !== null &&
        this.theme.title !== undefined
        ? this.theme.title
        : this.shop.title;
    },

    in_custom_home_page() {
      if (this.viewOnly) return true;
      return this.$route.name === this.getCustomHomePage();
    },
  },

  watch: {},

  created() {},

  mounted() {},

  methods: {
    goToShopInfoPage() {
      if (this.$route.name === window.$storefront.routes.SHOP_INFO_PAGE_MOBILE)
        this.$router.push({ name: window.$storefront.routes.SHOP_PAGE });
      else
        this.$router.push({
          name: window.$storefront.routes.SHOP_INFO_PAGE_MOBILE,
        });
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-main-header-logo {
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--shop-main-header-logo {
}
</style>
